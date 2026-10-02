#!/usr/bin/env bash
# Start the built image and ask it what the live site is asked.
#
#   bash scripts/image-smoke.sh <image>          e.g. www_web:ci
#
# The checks workflow runs this on every pull request, BEFORE anything is
# merged. Until now the only test of the Dockerfile and of nginx/nginx.conf was
# the sandbox deploy itself: a config nginx would not load was found by the
# sandbox going down.
#
# It asserts what the site is MEANT to answer, so a change to nginx.conf that
# breaks one of these shows up here as a FAIL with the line that broke:
#
#   1. nginx accepts the config.
#   2. A container with NO mounts (what `www_web` is in production): the site
#      answers, an unknown path gets the app (it is a single-page app), the
#      bundle named in index.html is served as javascript and carries the
#      footer's version, the bare domain redirects to www with path and query
#      intact, and both calendar-hook routes are CLOSED (404), because there
#      is no capability map.
#   3. A container with a capability map mounted (what `web` is): the mapped
#      hook path answers 204 and is written to the log, the mapped drain path
#      serves that log as text/plain, and every other path is still 404.
#   4. The three security headers (nginx/security-headers.conf) are on every
#      kind of answer, each exactly once: a page, the bundle, the bare domain's
#      redirect, a refused hook, the hook's 204 and the drain. "Exactly once,
#      everywhere" is the point: in nginx a location with an add_header of its
#      own silently drops every add_header from the level above, so a header
#      set in one place goes missing in another without any error.
#   5. A real browser (headless Chrome) loads the page from the container and
#      the app draws its footer. curl cannot tell whether a header stops a
#      browser from running the site; this can. Skipped with a notice where
#      there is no Chrome, except under CI=true, where that is a FAIL.
#
# The map used here is made up on the spot (thirty-two 1s, thirty-two 2s). The
# real one lives only on the server and is never in this repository.
#
# One PASS or FAIL line per assert; exit 1 if any failed. Both containers are
# removed on the way out, whatever happened.
set -euo pipefail

IMAGE="${1:?usage: bash scripts/image-smoke.sh <image>}"
PORT_PLAIN="${SMOKE_PORT_PLAIN:-18080}"
PORT_MAP="${SMOKE_PORT_MAP:-18081}"
PLAIN="www-smoke-plain-$$"
MAPPED="www-smoke-map-$$"
# The version the footer should show: package.json's, unless the image was
# built with an APP_VERSION (then say which in SMOKE_VERSION).
here="$(cd "$(dirname "$0")" && pwd)"
VERSION="${SMOKE_VERSION:-$(sed -n 's/^  "version": "\([^"]*\)",$/\1/p' "$here/../package.json" | head -n 1)}"
ZEROS=00000000000000000000000000000000
ONES=11111111111111111111111111111111
TWOS=22222222222222222222222222222222

work="$(mktemp -d)"
passes=0
fails=0

cleanup() {
  docker rm -f "$PLAIN" "$MAPPED" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

pass() {
  passes=$((passes + 1))
  echo "PASS  $1"
}

fail() {
  fails=$((fails + 1))
  echo "FAIL  $1"
}

# check <what> <got> <want>
check() {
  if [ "$2" = "$3" ]; then
    pass "$1 ($2)"
  else
    fail "$1: got '$2', want '$3'"
  fi
}

# req <port> <host> <method> <path> [more curl arguments]
# Sets STATUS, CTYPE and REDIRECT; the body is left in $work/body and the
# response's headers in $work/headers.
req() {
  local port="$1" host="$2" method="$3" path="$4" out
  shift 4
  : >"$work/body"
  : >"$work/headers"
  out="$(curl -sS -o "$work/body" -D "$work/headers" --max-time 10 -X "$method" -H "Host: $host" ${@+"$@"} \
    -w '%{http_code}\n%{content_type}\n%{redirect_url}\n' \
    "http://127.0.0.1:${port}${path}" 2>"$work/curl-error")" || out="curl-failed"
  STATUS="$(printf '%s\n' "$out" | sed -n 1p)"
  CTYPE="$(printf '%s\n' "$out" | sed -n 2p)"
  REDIRECT="$(printf '%s\n' "$out" | sed -n 3p)"
  if [ "$STATUS" = "curl-failed" ]; then
    cat "$work/curl-error"
  fi
}

# header <name>: the value of ONE header of the last response. The name is
# matched whatever its case and the line's closing CR is removed. Empty when the
# header is absent; if it is there more than once, the values joined by " | ".
header() {
  awk -v want="$1" '
    BEGIN { want = tolower(want); found = 0; out = "" }
    {
      sub(/\r$/, "")
      colon = index($0, ":")
      if (colon == 0 || tolower(substr($0, 1, colon - 1)) != want) next
      value = substr($0, colon + 1)
      sub(/^[ \t]+/, "", value)
      out = (found ? out " | " : "") value
      found = found + 1
    }
    END { print out }
  ' "$work/headers"
}

# header_count <name>: how many times that header is in the last response.
header_count() {
  awk -v want="$1" '
    BEGIN { want = tolower(want); found = 0 }
    {
      colon = index($0, ":")
      if (colon > 0 && tolower(substr($0, 1, colon - 1)) == want) found = found + 1
    }
    END { print found }
  ' "$work/headers"
}

# header_once <what> <name> <want>: the last response carries that header
# exactly once, with exactly that value.
header_once() {
  check "$1: $2" "$(header_count "$2")x $(header "$2")" "1x $3"
}

# security_headers <what>: the three headers of nginx/security-headers.conf,
# each exactly once, on the last response.
security_headers() {
  header_once "$1" X-Content-Type-Options "nosniff"
  header_once "$1" Referrer-Policy "strict-origin-when-cross-origin"
  header_once "$1" Content-Security-Policy "frame-ancestors 'self'"
}

# wait_up <port> <container>: up to 30 s for the first answer.
wait_up() {
  local port="$1" name="$2" tries=0
  while [ "$tries" -lt 30 ]; do
    if curl -s -o /dev/null --max-time 2 "http://127.0.0.1:${port}/"; then
      return 0
    fi
    tries=$((tries + 1))
    sleep 1
  done
  fail "container $name never answered on port $port"
  docker logs "$name" 2>&1 | tail -n 30 || true
}

# still_up <what> <container>: running, and never restarted.
still_up() {
  local state
  state="$(docker inspect -f '{{.State.Running}} {{.RestartCount}}' "$2" 2>/dev/null || echo "inspect failed")"
  check "$1" "$state" "true 0"
}

echo "== image: $IMAGE"
docker run --rm "$IMAGE" nginx -v 2>&1 || true

echo "== 1. nginx reads the config"
if docker run --rm "$IMAGE" nginx -t >"$work/nginx-t" 2>&1; then
  pass "nginx -t accepts the config with no capability map"
else
  fail "nginx -t rejects the config with no capability map"
fi
cat "$work/nginx-t"

echo "== 2. a container with no mounts"
docker run -d --name "$PLAIN" -p "127.0.0.1:${PORT_PLAIN}:80" "$IMAGE" >/dev/null
wait_up "$PORT_PLAIN" "$PLAIN"

req "$PORT_PLAIN" www.travish.com GET /
check "www host, GET / status" "$STATUS" 200
check "www host, GET / content type" "$CTYPE" text/html
bundle="$(grep -oE 'src="?/[^" >]+\.js' "$work/body" | head -n 1 | sed -E 's/^src="?//' || true)"
if [ -n "$bundle" ]; then
  pass "index.html names a script ($bundle)"
else
  fail "index.html names no .js file"
  bundle="/no-script-named-in-index.js"
fi
security_headers "www host, GET /"

req "$PORT_PLAIN" www.travish.com GET /piano
check "www host, GET /piano status (the app answers every page)" "$STATUS" 200
check "www host, GET /piano content type" "$CTYPE" text/html
security_headers "www host, GET /piano"

req "$PORT_PLAIN" www.travish.com GET "$bundle"
check "www host, GET $bundle status" "$STATUS" 200
case "$CTYPE" in
  *javascript*) pass "www host, GET $bundle content type ($CTYPE)" ;;
  *) fail "www host, GET $bundle content type: got '$CTYPE', want a javascript type" ;;
esac
# The footer's version, as this image was really built. An image built with no
# build arguments must say package.json's version, never v0.0.0.
if grep -qF "v${VERSION}+" "$work/body"; then
  pass "the served bundle carries the footer version v${VERSION}+"
else
  fail "the served bundle does not carry the footer version v${VERSION}+"
fi
security_headers "www host, GET the bundle"

req "$PORT_PLAIN" travish.com GET "/piano?x=1"
check "bare host, GET /piano?x=1 status" "$STATUS" 301
check "bare host, GET /piano?x=1 goes to" "$REDIRECT" "https://www.travish.com/piano?x=1"
security_headers "bare host, the 301"

req "$PORT_PLAIN" travish.com POST "/gcal-hook/$ZEROS" --data ''
check "no map: POST /gcal-hook/<zeros> status" "$STATUS" 404
security_headers "no map: the hook's 404"
req "$PORT_PLAIN" travish.com GET "/gcal-drain/$ZEROS"
check "no map: GET /gcal-drain/<zeros> status" "$STATUS" 404

# A real browser, not curl: Chrome fetches the page, runs the script and the
# app draws its footer. The page as served holds no version text (index.html is
# an empty <div id=root> and a script tag), so "v<version>+" is in the DOM only
# if the script ran. The address is 127.0.0.1, which the config treats like any
# host that is not the bare domain: it serves the site.
CHROME="${SMOKE_CHROME:-google-chrome}"
if command -v "$CHROME" >/dev/null 2>&1; then
  # Chrome is started in the background and stopped from here: after printing
  # the page it does not always exit by itself (seen with Chrome 154), and a
  # check that hangs is worse than none. Up to 60 s for the footer to appear.
  : >"$work/dom"
  "$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
    --user-data-dir="$work/chrome-profile" --virtual-time-budget=15000 --dump-dom \
    "http://127.0.0.1:${PORT_PLAIN}/" >"$work/dom" 2>"$work/chrome-error" &
  chrome_pid=$!
  tries=0
  while [ "$tries" -lt 60 ]; do
    if grep -qF "v${VERSION}+" "$work/dom"; then
      break
    fi
    if ! kill -0 "$chrome_pid" 2>/dev/null; then
      break
    fi
    tries=$((tries + 1))
    sleep 1
  done
  kill "$chrome_pid" 2>/dev/null || true
  wait "$chrome_pid" 2>/dev/null || true
  if grep -qF "v${VERSION}+" "$work/dom"; then
    pass "a browser ran the app from this container: the footer's v${VERSION}+ is on the page"
  else
    fail "a browser did not draw the footer's v${VERSION}+ from this container"
    tail -n 20 "$work/chrome-error" || true
    head -c 800 "$work/dom" || true
    echo
  fi
elif [ "${CI:-}" = "true" ]; then
  fail "no $CHROME on this runner: the browser check did not run"
else
  echo "SKIP  no $CHROME here: the browser check did not run (under CI=true this is a FAIL)"
fi

still_up "the no-mount container is running and never restarted" "$PLAIN"

echo "== 3. a container with a capability map mounted"
mkdir "$work/gcal"
printf '/gcal-hook/%s   hook;\n/gcal-drain/%s  drain;\n' "$ONES" "$TWOS" >"$work/gcal/capabilities.map"
chmod 755 "$work" "$work/gcal"
chmod 644 "$work/gcal/capabilities.map"

if docker run --rm -v "$work/gcal:/etc/nginx/gcal:ro" "$IMAGE" nginx -t >"$work/nginx-t" 2>&1; then
  pass "nginx -t accepts the config with a capability map"
else
  fail "nginx -t rejects the config with a capability map"
  cat "$work/nginx-t"
fi

docker run -d --name "$MAPPED" -p "127.0.0.1:${PORT_MAP}:80" \
  -v "$work/gcal:/etc/nginx/gcal:ro" "$IMAGE" >/dev/null
wait_up "$PORT_MAP" "$MAPPED"

req "$PORT_MAP" travish.com POST "/gcal-hook/$ZEROS" --data ''
check "map: POST a wrong hook path status" "$STATUS" 404
req "$PORT_MAP" travish.com GET "/gcal-drain/$ZEROS"
check "map: GET a wrong drain path status" "$STATUS" 404
req "$PORT_MAP" travish.com GET "/gcal-drain/$ONES"
check "map: the hook's secret does not open the drain" "$STATUS" 404

req "$PORT_MAP" travish.com POST "/gcal-hook/$ONES" --data '' \
  -H 'X-Goog-Channel-ID: smoke-channel' -H 'X-Goog-Resource-State: exists'
check "map: POST the mapped hook path status" "$STATUS" 204
# Google must never be handed a cached answer for a ring.
header_once "map: the hook's 204" Cache-Control "no-store"
security_headers "map: the hook's 204"

# The log line is written as the 204 is sent; allow it a moment to land.
lines=0
tries=0
while [ "$tries" -lt 5 ]; do
  req "$PORT_MAP" travish.com GET "/gcal-drain/$TWOS"
  lines="$(grep -c . "$work/body" || true)"
  if [ "$lines" != 0 ]; then
    break
  fi
  tries=$((tries + 1))
  sleep 1
done
check "map: GET the mapped drain path status" "$STATUS" 200
check "map: GET the mapped drain path content type" "$CTYPE" text/plain
check "map: the drain holds one line (the wrong paths were not logged)" "$lines" 1
if grep -q 'channel=smoke-channel state=exists' "$work/body"; then
  pass "map: that line is the ring just sent"
else
  fail "map: the drain's body is not the ring just sent"
  cat "$work/body"
fi
# Nor may the laptop be handed a cached copy of the log.
header_once "map: the drain's 200" Cache-Control "no-store"
security_headers "map: the drain's 200"

req "$PORT_MAP" www.travish.com GET /
check "map: the site itself still answers, GET / status" "$STATUS" 200

still_up "the container with the map is running and never restarted" "$MAPPED"

echo "== $passes passed, $fails failed"
if [ "$fails" -ne 0 ]; then
  exit 1
fi
