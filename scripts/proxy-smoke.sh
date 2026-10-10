#!/usr/bin/env bash
# Rehearse the proxy that stands in front of the site, at the version
# reverse-proxy/docker-compose.yml names, with the built image behind it.
#
#   bash scripts/proxy-smoke.sh <image> [<chat image>]   e.g. www_web:ci chat:ci
#
# ⚠️ FOR A THROWAWAY MACHINE ONLY (GitHub's runner). It starts a container
# called `nginx-proxy` on ports 80 and 443, and it is never to be run on a
# server. It refuses to start where it finds what a server has: a container of
# that name, a container called `proxy` or `acme` (the README's names for the
# pair), any container of the proxy's or the certificate companion's image
# whatever it is called, or anything already published on port 80 or 443.
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
#   6. (26.1010) The chat at /chat/, started the way the deploys start it: its
#      own container on a private network, the site's containers created on
#      that network and put on the proxy's before they start. Through the
#      proxy: /chat redirects to /chat/, the page and its files come from the
#      chat, the live connection upgrades to a WebSocket, and two people hold a
#      real conversation over it (scripts/chat-smoke.mjs). With the chat
#      stopped, /chat/ alone fails (502) and the site still answers; started
#      again, /chat/ comes back without touching the site.
#      Needs the chat image as the second argument; without one this part is
#      skipped, except under CI=true, where that is a FAIL.
#
# What it does NOT prove, and cannot: certificates. No certificate is issued
# here, the companion container (acme-companion) is not started, port 443 is
# not asked anything, and nothing shows that the volumes already on a server
# (its certificates, its vhost.d files) carry over to the new containers.
#
# One PASS or FAIL line per assert; exit 1 if any failed. Everything it started
# is removed again, volumes included, whatever happened.
set -euo pipefail

IMAGE="${1:?usage: bash scripts/proxy-smoke.sh <image> [<chat image>]}"
CHAT_IMAGE="${2:-}"
here="$(cd "$(dirname "$0")" && pwd)"
COMPOSE="$here/../reverse-proxy/docker-compose.yml"
PROJECT=www-proxy-rehearsal
# The name the compose file gives the proxy, and the one the sandbox deploy
# addresses with `docker exec`.
PROXY=nginx-proxy
WEB=proxy-rehearsal-web
WWW=proxy-rehearsal-www_web
CHAT=proxy-rehearsal-chat
# The deploys call it www-chat; any name works, nginx only asks for `chat`.
NET=proxy-rehearsal-www-chat
PORT="${PROXY_SMOKE_PORT:-80}"
ZEROS=00000000000000000000000000000000
IMMUTABLE='public, max-age=31536000, immutable'

# Never on a server. One line per container, running or not: its name, its
# image, the ports it publishes. The list is read into a variable first and awk
# reads all of it, so a `docker ps` that fails stops the script right here
# (set -e) instead of reading as "nothing there", and no early exit of a reader
# can turn a match into a miss under `pipefail`.
existing="$(docker ps -a --format '{{.Names}} {{.Image}} {{.Ports}}')"
found="$(printf '%s\n' "$existing" | awk -v proxy="$PROXY" '
  $1 == proxy || $1 == "proxy" || $1 == "acme" ||
  $2 ~ /nginx-proxy|acme-companion/ ||
  $0 ~ /:(80|443)->/ { print "  " $0 }
')"
if [ -n "$found" ]; then
  echo "This machine already has a proxy, or something on port 80 or 443:"
  echo "$found"
  echo "This rehearsal is for a throwaway machine, never a server."
  echo "Nothing was started or changed."
  exit 2
fi

work="$(mktemp -d)"
passes=0
fails=0

remove_everything() {
  docker rm -f "$WEB" "$WWW" "$CHAT" >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
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
# proxy and started the way the deploy workflows do it (26.1010): created on
# the chat's network, put on the proxy's default network, then started.
start_site() {
  docker create --name "$1" --network "$NET" -e VIRTUAL_HOST="$2" -e VIRTUAL_PORT=80 "$IMAGE" >/dev/null
  docker network connect bridge "$1"
  docker start "$1" >/dev/null
}

# start_chat: the chat as the deploys start it. Its name here is the
# rehearsal's own; `chat` is what nginx.conf asks for, given as an alias.
start_chat() {
  docker run -d --name "$CHAT" --network "$NET" --network-alias chat \
    -e BASE_PATH=/chat -e PORT=8081 "$CHAT_IMAGE" >/dev/null
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

echo "== 2. two containers of the site behind it (and the chat, when given)"
docker network create "$NET" >/dev/null
if [ -n "$CHAT_IMAGE" ]; then
  start_chat
fi
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

echo "== 2½. the chat at /chat/"
# wait_for_chat <want status>: up to 30 s for /chat/ on www to answer that.
wait_for_chat() {
  local tries=0
  while [ "$tries" -lt 30 ]; do
    req www.travish.com GET /chat/
    if [ "$STATUS" = "$1" ]; then
      return 0
    fi
    tries=$((tries + 1))
    sleep 1
  done
  return 1
}
if [ -z "$CHAT_IMAGE" ]; then
  if [ "${CI:-}" = "true" ]; then
    fail "no chat image given: the chat checks did not run"
  else
    echo "SKIP  no chat image given: the chat checks did not run (under CI=true this is a FAIL)"
  fi
else
  req www.travish.com GET /chat
  check "www host, GET /chat status (to the slash)" "$STATUS" 301
  header_once "www host, GET /chat" Location "/chat/"
  security_headers "www host, the /chat redirect"

  req travish.com GET "/chat/?x=1"
  check "bare host, GET /chat/?x=1 status" "$STATUS" 301
  check "bare host, GET /chat/?x=1 goes to" "$REDIRECT" "https://www.travish.com/chat/?x=1"

  wait_for_chat 200 || true
  check "www host, GET /chat/ status" "$STATUS" 200
  check "www host, GET /chat/ content type" "$CTYPE" "text/html; charset=UTF-8"
  if grep -qF 'src="socket.io/socket.io.js"' "$work/body"; then
    pass "www host, /chat/ is the chat's page (it loads its live connection by a relative address)"
  else
    fail "www host, /chat/ is not the chat's page"
    head -c 400 "$work/body" || true
    echo
  fi
  security_headers "www host, GET /chat/"
  header_absent "www host, GET /chat/" X-Powered-By

  req www.travish.com GET /chat/client.js
  check "www host, GET /chat/client.js status" "$STATUS" 200
  req www.travish.com GET /chat/socket.io/socket.io.js
  check "www host, GET /chat/socket.io/socket.io.js status" "$STATUS" 200

  req www.travish.com GET "/chat/socket.io/?EIO=4&transport=polling"
  check "www host, the live connection's first answer (polling) status" "$STATUS" 200
  if grep -qF '0{"sid"' "$work/body"; then
    pass "www host, the live connection opens (polling)"
  else
    fail "www host, the live connection did not open (polling): $(head -c 200 "$work/body")"
  fi

  # The upgrade to a WebSocket, by hand: a 101 and the chat's opening packet.
  # The connection stays open, so curl is stopped after 3 s (exit 28 is fine).
  : >"$work/ws-headers"
  : >"$work/ws-body"
  curl -sS --http1.1 -N --max-time 3 -D "$work/ws-headers" -o "$work/ws-body" \
    -H "Host: www.travish.com" -H "Connection: Upgrade" -H "Upgrade: websocket" \
    -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
    "http://127.0.0.1:${PORT}/chat/socket.io/?EIO=4&transport=websocket" 2>/dev/null || true
  check "www host, the WebSocket upgrade status" "$(head -n 1 "$work/ws-headers" | awk '{print $2}')" 101
  if grep -aqF '0{"sid"' "$work/ws-body"; then
    pass "www host, the chat's opening packet arrives over the WebSocket"
  else
    fail "www host, no opening packet over the WebSocket"
  fi

  # A real conversation, from a container that reaches the proxy the way a
  # visitor does (the host's port), by the site's real name.
  if docker run --rm --add-host "www.travish.com:host-gateway" \
    -v "$here/chat-smoke.mjs:/chat-smoke.mjs:ro" "$CHAT_IMAGE" \
    node /chat-smoke.mjs "ws://www.travish.com:${PORT}/chat/socket.io/"; then
    pass "two people talk over the chat through the proxy"
  else
    fail "two people could not talk over the chat through the proxy"
  fi

  # The chat must never take the site with it.
  docker stop "$CHAT" >/dev/null
  wait_for_chat 502 || true
  check "chat stopped: www host, GET /chat/ status" "$STATUS" 502
  req www.travish.com GET /
  check "chat stopped: www host, GET / status (the site still answers)" "$STATUS" 200
  docker start "$CHAT" >/dev/null
  wait_for_chat 200 || true
  check "chat started again: www host, GET /chat/ status (no site restart)" "$STATUS" 200
  still_up_proxy() {
    check "$1" "$(docker inspect -f '{{.State.Running}} {{.RestartCount}}' "$2" 2>/dev/null || echo 'inspect failed')" "true 0"
  }
  still_up_proxy "the www container never restarted" "$WWW"
fi

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
left="$(docker ps -a --format '{{.Names}}' | grep -cx -e "$PROXY" -e "$WEB" -e "$WWW" -e "$CHAT" || true)"
check "containers of this rehearsal left behind" "$left" 0
left="$(docker network ls --format '{{.Name}}' | grep -cx "$NET" || true)"
check "networks of this rehearsal left behind" "$left" 0
left="$(docker volume ls -q | grep -c "^${PROJECT}_" || true)"
check "volumes of this rehearsal left behind" "$left" 0

echo "== $passes passed, $fails failed"
if [ "$fails" -ne 0 ]; then
  exit 1
fi
