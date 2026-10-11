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
#   6. What a browser may keep, and for how long. A page (index.html, whatever
#      the address) says `no-cache`: ask again every time, so a visitor gets
#      the new site after an update. A built file, whose name holds a hash of
#      its content, says a year and `immutable`: a changed file has a new name.
#      And a built file that is NOT there answers a real 404, with no cache
#      header and without the app's page: before, the server answered a missing
#      script with index.html and a 200, the browser tried to run a web page as
#      a script, and the visitor saw a blank page until a hard reload. An
#      unknown PAGE address still gets the app (the server cannot know the
#      app's routes); the app shows its own "not found".
#   7. (26.1009) The bundle and stylesheet come back gzipped when asked, and
#      plain when not; the .otf and .ttf fonts carry font types; /journal and
#      everything under it answers 410 Gone; robots.txt and sitemap.xml are
#      served.
#   8. (26.1010) With no chat anywhere (this container is on no chat network),
#      nginx still starts and the site still answers (1 and 2 above), /chat
#      still redirects to /chat/, and /chat/ alone fails, with a 502. The chat
#      itself is rehearsed in scripts/proxy-smoke.sh.
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
# What a built file (its name holds a hash of its content) says about caching.
IMMUTABLE='public, max-age=31536000, immutable'

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

# header_absent <what> <name>: the last response does not carry that header.
header_absent() {
  check "$1: no $2 header" "$(header_count "$2")x" "0x"
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
stylesheet="$(grep -oE 'href="?/[^" >]+\.css' "$work/body" | head -n 1 | sed -E 's/^href="?//' || true)"
if [ -n "$stylesheet" ]; then
  pass "index.html names a stylesheet ($stylesheet)"
else
  fail "index.html names no .css file"
  stylesheet="/no-stylesheet-named-in-index.css"
fi
security_headers "www host, GET /"
# The page itself is asked for again on every visit: it is the one file whose
# name never changes, and it names all the others.
header_once "www host, GET /" Cache-Control "no-cache"
# This container says what it is, not which version. (Visitors get the
# proxy's Server header instead, which this test cannot see.)
header_once "www host, GET /" Server "nginx"

req "$PORT_PLAIN" www.travish.com GET /piano
check "www host, GET /piano status (the app answers every page)" "$STATUS" 200
check "www host, GET /piano content type" "$CTYPE" text/html
security_headers "www host, GET /piano"
header_once "www host, GET /piano" Cache-Control "no-cache"

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
header_once "www host, GET the bundle" Cache-Control "$IMMUTABLE"

req "$PORT_PLAIN" www.travish.com GET "$stylesheet"
check "www host, GET the stylesheet status" "$STATUS" 200
check "www host, GET the stylesheet content type" "$CTYPE" text/css
header_once "www host, GET the stylesheet" Cache-Control "$IMMUTABLE"
# The stylesheet names the fonts (as url(name.hash.otf), beside it at the
# root); take one of each kind from it.
otf="$(grep -oE '[A-Za-z0-9._-]+\.otf' "$work/body" | head -n 1 | sed 's|^|/|' || true)"
ttf="$(grep -oE '[A-Za-z0-9._-]+\.ttf' "$work/body" | head -n 1 | sed 's|^|/|' || true)"

# 7. Compression (26.1009): asked for gzip, the bundle and the stylesheet come
# back gzipped, and say that the answer depends on Accept-Encoding.
req "$PORT_PLAIN" www.travish.com GET "$bundle" -H 'Accept-Encoding: gzip'
check "www host, the bundle asked for with gzip: status" "$STATUS" 200
header_once "www host, the bundle asked for with gzip" Content-Encoding "gzip"
header_once "www host, the bundle asked for with gzip" Vary "Accept-Encoding"
req "$PORT_PLAIN" www.travish.com GET "$stylesheet" -H 'Accept-Encoding: gzip'
header_once "www host, the stylesheet asked for with gzip" Content-Encoding "gzip"
# And not asked for, not given: a client that cannot unpack gets plain text.
req "$PORT_PLAIN" www.travish.com GET "$bundle"
header_absent "www host, the bundle asked for plainly" Content-Encoding

# The two font kinds go out as fonts, not as application/octet-stream.
if [ -n "$otf" ] && [ -n "$ttf" ]; then
  req "$PORT_PLAIN" www.travish.com GET "$otf"
  check "www host, GET an .otf font content type" "$CTYPE" font/otf
  req "$PORT_PLAIN" www.travish.com GET "$ttf"
  check "www host, GET a .ttf font content type" "$CTYPE" font/ttf
else
  fail "the stylesheet names no .otf and .ttf font to check (otf='$otf' ttf='$ttf')"
fi

# /journal is gone for good: 410, on the address and under it.
req "$PORT_PLAIN" www.travish.com GET /journal
check "www host, GET /journal status (gone for good)" "$STATUS" 410
security_headers "www host, the /journal 410"
req "$PORT_PLAIN" www.travish.com GET /journal/26/10/261009.html
check "www host, GET under /journal/ status" "$STATUS" 410
req "$PORT_PLAIN" travish.com GET /journal
check "bare host, GET /journal status (redirected first, like every page)" "$STATUS" 301

# For search engines: robots.txt names the sitemap; both are plain files.
req "$PORT_PLAIN" www.travish.com GET /robots.txt
check "www host, GET /robots.txt status" "$STATUS" 200
check "www host, GET /robots.txt content type" "$CTYPE" text/plain
if grep -qF 'Sitemap: https://www.travish.com/sitemap.xml' "$work/body"; then
  pass "robots.txt names the sitemap"
else
  fail "robots.txt does not name https://www.travish.com/sitemap.xml"
fi
req "$PORT_PLAIN" www.travish.com GET /sitemap.xml
check "www host, GET /sitemap.xml status" "$STATUS" 200
check "www host, GET /sitemap.xml content type" "$CTYPE" text/xml
if grep -qF '<loc>https://www.travish.com/piano</loc>' "$work/body"; then
  pass "sitemap.xml lists the site's pages"
else
  fail "sitemap.xml does not list https://www.travish.com/piano"
fi

req "$PORT_PLAIN" www.travish.com GET "${bundle}.map"
check "www host, GET the bundle's source map status" "$STATUS" 200
header_once "www host, GET the bundle's source map" Cache-Control "$IMMUTABLE"

# A built file that is not there (what a browser holding last week's page asks
# for after an update). It must be a real 404: no cache header at all (least of
# all the year-long one), not the app's page, and no nginx version in the body.
req "$PORT_PLAIN" www.travish.com GET /definitely-missing.1234abcd.js
check "www host, GET a missing built .js status" "$STATUS" 404
header_absent "www host, a missing built .js" Cache-Control
if grep -qF '<script' "$work/body"; then
  fail "www host, a missing built .js is answered with a page that has a <script (the app's page)"
else
  pass "www host, a missing built .js is not answered with the app's page (no <script in the body)"
fi
if grep -qF 'nginx/' "$work/body"; then
  fail "www host, a missing built .js: the body prints the nginx version"
else
  pass "www host, a missing built .js: the body does not print the nginx version"
fi
security_headers "www host, a missing built .js"
req "$PORT_PLAIN" www.travish.com GET /definitely-missing.1234abcd.css
check "www host, GET a missing built .css status" "$STATUS" 404
# The same three things for a stylesheet. One location answers both today;
# these hold it if the two are ever given separate rules.
header_absent "www host, a missing built .css" Cache-Control
if grep -qF '<script' "$work/body"; then
  fail "www host, a missing built .css is answered with a page that has a <script (the app's page)"
else
  pass "www host, a missing built .css is not answered with the app's page (no <script in the body)"
fi
if grep -qF 'nginx/' "$work/body"; then
  fail "www host, a missing built .css: the body prints the nginx version"
else
  pass "www host, a missing built .css: the body does not print the nginx version"
fi

# An unknown PAGE address is still answered by the app, dots or no dots.
req "$PORT_PLAIN" www.travish.com GET /no-such-page
check "www host, GET /no-such-page status (an unknown page still gets the app)" "$STATUS" 200
check "www host, GET /no-such-page content type" "$CTYPE" text/html
req "$PORT_PLAIN" www.travish.com GET /blog/some.thing
check "www host, GET /blog/some.thing status (an unknown page still gets the app)" "$STATUS" 200
check "www host, GET /blog/some.thing content type" "$CTYPE" text/html

req "$PORT_PLAIN" travish.com GET "/piano?x=1"
check "bare host, GET /piano?x=1 status" "$STATUS" 301
check "bare host, GET /piano?x=1 goes to" "$REDIRECT" "https://www.travish.com/piano?x=1"
security_headers "bare host, the 301"
# A side effect, pinned so it is a decision and not an accident: the redirect
# is given by the same location as the pages, so it says no-cache too and a
# browser asks for it again each time instead of remembering it for good.
header_once "bare host, the 301" Cache-Control "no-cache"

# The bare domain redirects a built file too (it serves nothing itself). That
# redirect comes from the built files' location, so it carries their header.
req "$PORT_PLAIN" travish.com GET "$bundle"
check "bare host, GET the bundle status" "$STATUS" 301
check "bare host, GET the bundle goes to" "$REDIRECT" "https://www.travish.com${bundle}"
header_once "bare host, the bundle's 301" Cache-Control "$IMMUTABLE"

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

# 8. The chat is not here: only /chat/ may notice.
req "$PORT_PLAIN" www.travish.com GET /chat
check "no chat: www host, GET /chat status (to the slash)" "$STATUS" 301
header_once "no chat: www host, GET /chat" Location "/chat/"
req "$PORT_PLAIN" www.travish.com GET /chat/
check "no chat: www host, GET /chat/ status (only the chat fails)" "$STATUS" 502
security_headers "no chat: the 502"
req "$PORT_PLAIN" travish.com GET /chat/
check "no chat: bare host, GET /chat/ status (redirected first, like every page)" "$STATUS" 301
req "$PORT_PLAIN" www.travish.com GET /
check "no chat: www host, GET / status (the site does not care)" "$STATUS" 200

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
# A path shaped like a built file, under a calendar route: it must be refused
# by that route's OWN location and never reach the built files' one. The proof
# is the no-store header, which only the two calendar locations send on a 404.
req "$PORT_MAP" travish.com POST "/gcal-hook/x.1234abcd.js" --data ''
check "map: POST /gcal-hook/x.1234abcd.js status" "$STATUS" 404
header_once "map: /gcal-hook/x.1234abcd.js was refused by the hook's own location" Cache-Control "no-store"
req "$PORT_MAP" travish.com GET "/gcal-drain/x.1234abcd.js"
check "map: GET /gcal-drain/x.1234abcd.js status" "$STATUS" 404
header_once "map: /gcal-drain/x.1234abcd.js was refused by the drain's own location" Cache-Control "no-store"

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
