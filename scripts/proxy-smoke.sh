#!/usr/bin/env bash
# Rehearse the proxy that stands in front of the site, at the version
# reverse-proxy/docker-compose.yml names, with the built image behind it.
#
#   bash scripts/proxy-smoke.sh <image>          e.g. www_web:ci
#
# ⚠️ FOR A THROWAWAY MACHINE ONLY (GitHub's runner). It starts a container
# called `nginx-proxy` on ports 80 and 443. It refuses to start where a
# container of that name already exists, and it is never to be run on a server.
#
# Why it exists: the two servers run a proxy from 2021 and 2022, and replacing
# it is done by hand, once, on a machine no check can reach. This is the part
# of that step that CAN be tried beforehand: the new proxy version, started
# from this repository's own compose file, routing to two containers of this
# repository's own image the way the deploys start them.
#
# What it proves, through the proxy, by Host header on port 80:
#   1. www.travish.com reaches the site (200), the bare domain's redirect to
#      www survives the proxy with path and query intact, and a request for a
#      calendar route on the bare domain is answered BY THE SITE (404 with the
#      site's own no-store), not by the proxy.
#   2. A host the proxy does not know gets the proxy's own 503.
#   3. The site's headers arrive unchanged and exactly once: the three security
#      headers, no-cache on a page, the year-long header on a built file, none
#      on a missing one.
#   4. The proxy is not the 2021 nginx (1.21.x) any more.
#   5. The sandbox deploy's own two commands still work on this proxy: writing
#      vhost.d/<host> through `docker exec nginx-proxy` and `nginx -s reload`,
#      after which every answer for that host carries X-Robots-Tag.
#
# What it does NOT prove, and cannot: certificates. No certificate is issued
# here, the companion container (acme-companion) is not started, port 443 is
# not asked anything, and nothing shows that the volumes already on a server
# (its certificates, its vhost.d files) carry over to the new containers.
#
# One PASS or FAIL line per assert; exit 1 if any failed. Everything it started
# is removed again, volumes included, whatever happened.
set -euo pipefail

IMAGE="${1:?usage: bash scripts/proxy-smoke.sh <image>}"
here="$(cd "$(dirname "$0")" && pwd)"
COMPOSE="$here/../reverse-proxy/docker-compose.yml"
PROJECT=www-proxy-rehearsal
# The name the compose file gives the proxy, and the one the sandbox deploy
# addresses with `docker exec`.
PROXY=nginx-proxy
WEB=proxy-rehearsal-web
WWW=proxy-rehearsal-www_web
PORT="${PROXY_SMOKE_PORT:-80}"
ZEROS=00000000000000000000000000000000
IMMUTABLE='public, max-age=31536000, immutable'

if docker ps -a --format '{{.Names}}' | grep -qx "$PROXY"; then
  echo "A container named $PROXY already exists here. This rehearsal is for a"
  echo "throwaway machine, never a server. Nothing was started or changed."
  exit 2
fi

work="$(mktemp -d)"
passes=0
fails=0

remove_everything() {
  docker rm -f "$WEB" "$WWW" >/dev/null 2>&1 || true
  docker compose -p "$PROJECT" -f "$COMPOSE" down -v >/dev/null 2>&1 || true
}

cleanup() {
  remove_everything
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

# req <host> <method> <path> [more curl arguments]
# Asks the PROXY, on its plain port, for that host. Sets STATUS, CTYPE and
# REDIRECT; the body is left in $work/body, the headers in $work/headers.
req() {
  local host="$1" method="$2" path="$3" out
  shift 3
  : >"$work/body"
  : >"$work/headers"
  out="$(curl -sS -o "$work/body" -D "$work/headers" --max-time 10 -X "$method" -H "Host: $host" ${@+"$@"} \
    -w '%{http_code}\n%{content_type}\n%{redirect_url}\n' \
    "http://127.0.0.1:${PORT}${path}" 2>"$work/curl-error")" || out="curl-failed"
  STATUS="$(printf '%s\n' "$out" | sed -n 1p)"
  CTYPE="$(printf '%s\n' "$out" | sed -n 2p)"
  REDIRECT="$(printf '%s\n' "$out" | sed -n 3p)"
}

# header <name>: the value of ONE header of the last response (name matched
# whatever its case, closing CR removed; several values joined by " | ").
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

header_once() {
  check "$1: $2" "$(header_count "$2")x $(header "$2")" "1x $3"
}

header_absent() {
  check "$1: no $2 header" "$(header_count "$2")x" "0x"
}

security_headers() {
  header_once "$1" X-Content-Type-Options "nosniff"
  header_once "$1" Referrer-Policy "strict-origin-when-cross-origin"
  header_once "$1" Content-Security-Policy "frame-ancestors 'self'"
}

# start_site <container> <host>: one container of the image, announced to the
# proxy the way the deploy workflows announce it.
start_site() {
  docker run -d --name "$1" -e VIRTUAL_HOST="$2" -e VIRTUAL_PORT=80 "$IMAGE" >/dev/null
}

# wait_for_site: up to 60 s for the proxy to answer 200 for www.
wait_for_site() {
  local tries=0
  while [ "$tries" -lt 60 ]; do
    req www.travish.com GET /
    if [ "$STATUS" = 200 ]; then
      return 0
    fi
    tries=$((tries + 1))
    sleep 1
  done
  return 1
}

# write_robots: the sandbox deploy's two commands, word for word, for the two
# hosts of this rehearsal (.github/workflows/deploy-to-dev.yml).
write_robots() {
  local h
  # `|| return 1` on each: called from an `if`, where `set -e` does not apply.
  for h in travish.com www.travish.com; do
    docker exec "$PROXY" sh -c "printf 'add_header X-Robots-Tag \"noindex, nofollow\" always;\n' > /etc/nginx/vhost.d/$h" || return 1
  done
  docker exec "$PROXY" nginx -s reload || return 1
}

echo "== image: $IMAGE behind the proxy of reverse-proxy/docker-compose.yml"
grep -E '^ *image:' "$COMPOSE" || true

echo "== 1. the proxy starts (only the proxy; the certificate companion is not started)"
if docker compose -p "$PROJECT" -f "$COMPOSE" up -d "$PROXY"; then
  pass "docker compose up -d $PROXY"
else
  fail "docker compose up -d $PROXY"
  echo "== $passes passed, $fails failed"
  exit 1
fi
version="$(docker exec "$PROXY" nginx -v 2>&1 || echo "nginx -v failed")"
echo "$version"
case "$version" in
  *nginx/1.21.*) fail "the proxy is still nginx 1.21 ($version)" ;;
  *nginx/*) pass "the proxy's nginx is not 1.21 any more" ;;
  *) fail "the proxy did not say its nginx version" ;;
esac

echo "== 2. two containers of the site behind it"
start_site "$WEB" travish.com
start_site "$WWW" www.travish.com
if wait_for_site; then
  pass "the proxy answers for www.travish.com within 60 s"
else
  fail "the proxy never answered 200 for www.travish.com (last status: $STATUS)"
fi

req www.travish.com GET /
check "www host, GET / status" "$STATUS" 200
check "www host, GET / content type" "$CTYPE" text/html
bundle="$(grep -oE 'src="?/[^" >]+\.js' "$work/body" | head -n 1 | sed -E 's/^src="?//' || true)"
if [ -z "$bundle" ]; then
  bundle="/no-script-named-in-index.js"
fi
security_headers "www host, GET /"
header_once "www host, GET /" Cache-Control "no-cache"
header_absent "www host, GET / (before the deploy's commands)" X-Robots-Tag
server="$(header Server)"
echo "Server header through the proxy: $server"
case "$server" in
  *nginx/1.21.*) fail "the Server header still says 1.21 ($server)" ;;
  "") fail "no Server header through the proxy" ;;
  *) pass "the Server header does not say 1.21" ;;
esac

req www.travish.com GET "$bundle"
check "www host, GET $bundle status" "$STATUS" 200
security_headers "www host, GET the bundle"
header_once "www host, GET the bundle" Cache-Control "$IMMUTABLE"

req www.travish.com GET /definitely-missing.1234abcd.js
check "www host, GET a missing built .js status" "$STATUS" 404
header_absent "www host, a missing built .js" Cache-Control
security_headers "www host, a missing built .js"

req travish.com GET "/piano?x=1"
check "bare host, GET /piano?x=1 status" "$STATUS" 301
check "bare host, GET /piano?x=1 goes to" "$REDIRECT" "https://www.travish.com/piano?x=1"
header_once "bare host, the 301" Cache-Control "no-cache"

# The proxy's own answer for a route it cannot place is 503. A 404 carrying the
# site's no-store says the request reached the site, which refused it (there is
# no capability map in this container).
req travish.com POST "/gcal-hook/$ZEROS" --data ''
check "bare host, POST /gcal-hook/<zeros> status (the site answered, not the proxy)" "$STATUS" 404
header_once "bare host, the hook's 404" Cache-Control "no-store"

req no-such-host.example GET /
check "a host the proxy does not know, GET / status (the proxy's own answer)" "$STATUS" 503

echo "== 3. the sandbox deploy's two commands, on this proxy version"
if write_robots; then
  pass "docker exec $PROXY: wrote vhost.d/<host> for both hosts and reloaded nginx"
else
  fail "docker exec $PROXY: writing vhost.d/<host> or the reload failed"
fi
sleep 2
req www.travish.com GET /
# Not an assert: the proxy only reads a vhost.d file it saw when it last wrote
# its own config, and it writes that when a container starts or stops. On a
# server the file is there from the deploy before; here it is brand new.
echo "NOTE  right after the reload, before any container restarted: X-Robots-Tag is '$(header X-Robots-Tag)' ($(header_count X-Robots-Tag)x)"

# The next deploy: the site's containers are replaced, then the same two
# commands run again. This is the order of every deploy after the first.
docker rm -f "$WEB" "$WWW" >/dev/null
start_site "$WEB" travish.com
start_site "$WWW" www.travish.com
if write_robots; then
  pass "the same two commands again, after the containers were replaced"
else
  fail "the same two commands failed after the containers were replaced"
fi
tries=0
while [ "$tries" -lt 60 ]; do
  req www.travish.com GET /
  if [ "$STATUS" = 200 ] && [ "$(header_count X-Robots-Tag)" != 0 ]; then
    break
  fi
  tries=$((tries + 1))
  sleep 1
done
check "after the next deploy, www host, GET / status" "$STATUS" 200
header_once "after the next deploy, www host, GET /" X-Robots-Tag "noindex, nofollow"
security_headers "after the next deploy, www host, GET /"
header_once "after the next deploy, www host, GET /" Cache-Control "no-cache"
req travish.com GET "/piano?x=1"
check "after the next deploy, bare host, GET /piano?x=1 status" "$STATUS" 301
header_once "after the next deploy, bare host, the 301" X-Robots-Tag "noindex, nofollow"

if [ "$fails" -ne 0 ]; then
  echo "== what the proxy logged, and the config it wrote (for the failure above)"
  docker logs "$PROXY" 2>&1 | tail -n 40 || true
  docker exec "$PROXY" sh -c 'grep -n "server_name\|include /etc/nginx/vhost.d\|return 503\|proxy_pass" /etc/nginx/conf.d/default.conf' || true
fi

echo "== 4. everything it started is removed again"
remove_everything
left="$(docker ps -a --format '{{.Names}}' | grep -cx -e "$PROXY" -e "$WEB" -e "$WWW" || true)"
check "containers of this rehearsal left behind" "$left" 0
left="$(docker volume ls -q | grep -c "^${PROJECT}_" || true)"
check "volumes of this rehearsal left behind" "$left" 0

echo "== $passes passed, $fails failed"
if [ "$fails" -ne 0 ]; then
  exit 1
fi
