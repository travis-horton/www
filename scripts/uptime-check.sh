#!/usr/bin/env bash
# Is the site up? Two questions, asked the way a visitor would (26.1010).
#
#   www    https://www.travish.com/ must answer 200, in text/html, with the
#          site's own page in it (the `<div id="root">` the app draws into).
#          The status alone is not enough: the site answers every address with
#          the same page, and the proxy in front of it answers in HTML too.
#   apex   https://travish.com/ must answer 301, pointing exactly at
#          https://www.travish.com/. The redirect is NOT followed: it is made
#          inside the container that serves the bare domain, so seeing it
#          proves that container is up. When that container is down the proxy
#          answers 503 instead. (On 26.0907 one of the two containers was down
#          for about 12 hours while the other looked healthy.)
#
# Each question is asked up to UPTIME_ATTEMPTS times, UPTIME_RETRY_DELAY
# seconds apart, and passes on the first good answer, so one slow moment is
# not an alarm. A refused connection or a timeout is a failed attempt, never a
# hang. Exit 0 only when both pass.
#
# Settings (environment), with the production values as defaults:
#   UPTIME_WWW_URL          https://www.travish.com/
#   UPTIME_APEX_URL         https://travish.com/
#   UPTIME_EXPECT_REDIRECT  https://www.travish.com/
#   UPTIME_ATTEMPTS         3
#   UPTIME_RETRY_DELAY      30   (seconds)
# When GITHUB_STEP_SUMMARY is set (inside GitHub Actions), the result lines are
# added to the run's summary page too.
#
# Run it by hand:   bash scripts/uptime-check.sh
# Its tests run it against a local stand-in server: scripts/uptime-check.test.js
set -u

WWW_URL="${UPTIME_WWW_URL:-https://www.travish.com/}"
APEX_URL="${UPTIME_APEX_URL:-https://travish.com/}"
EXPECT_REDIRECT="${UPTIME_EXPECT_REDIRECT:-https://www.travish.com/}"
ATTEMPTS="${UPTIME_ATTEMPTS:-3}"
RETRY_DELAY="${UPTIME_RETRY_DELAY:-30}"

# Every request says who it is, so these visits can be told apart in a log.
USER_AGENT='travish-uptime-check (+https://github.com/travis-horton/www)'
ROOT_MARKER='<div id="root">'

case "$ATTEMPTS" in
  '' | *[!0-9]* | 0) echo "UPTIME_ATTEMPTS must be a whole number of 1 or more, not '$ATTEMPTS'" >&2; exit 2 ;;
esac
case "$RETRY_DELAY" in
  '' | *[!0-9]*) echo "UPTIME_RETRY_DELAY must be a whole number of seconds, not '$RETRY_DELAY'" >&2; exit 2 ;;
esac

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Prints a result line, and adds it to the GitHub step summary when there is one.
report() {
  echo "$1"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    echo "- \`$1\`" >>"$GITHUB_STEP_SUMMARY"
  fi
}

# Asks $1 once, never following a redirect. Sets STATUS (000 when nothing
# answered), CTYPE, LOCATION and, when nothing answered, WHY. The body is left
# in $WORK/body.
fetch() {
  STATUS=000
  CTYPE=''
  LOCATION=''
  WHY=''
  : >"$WORK/body"
  : >"$WORK/headers"
  local out
  out="$(curl --silent --show-error \
    --connect-timeout 10 --max-time 20 \
    --user-agent "$USER_AGENT" \
    --dump-header "$WORK/headers" --output "$WORK/body" \
    --write-out '%{http_code} %{content_type}' \
    "$1" 2>"$WORK/error")"
  STATUS="${out%% *}"
  CTYPE="${out#* }"
  [ "$CTYPE" = "$out" ] && CTYPE=''
  [ -n "$STATUS" ] || STATUS=000
  if [ "$STATUS" = 000 ]; then
    WHY="no answer ($(head -n 1 "$WORK/error" | tr -d '\r'))"
    return
  fi
  local line
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    case "$line" in
      [Ll][Oo][Cc][Aa][Tt][Ii][Oo][Nn]:*)
        LOCATION="${line#*:}"
        LOCATION="${LOCATION# }"
        ;;
    esac
  done <"$WORK/headers"
}

probe_www() {
  fetch "$WWW_URL"
  [ "$STATUS" = 000 ] && return 1
  if [ "$STATUS" != 200 ]; then
    WHY="expected 200"
    return 1
  fi
  case "$CTYPE" in
    text/html*) ;;
    *)
      WHY="expected text/html, got '${CTYPE:-no content type}'"
      return 1
      ;;
  esac
  if ! grep -qF "$ROOT_MARKER" "$WORK/body"; then
    WHY="a page that is not the site (no $ROOT_MARKER in it)"
    return 1
  fi
  WHY="the site's page"
}

probe_apex() {
  fetch "$APEX_URL"
  [ "$STATUS" = 000 ] && return 1
  if [ "$STATUS" != 301 ]; then
    WHY="expected 301 to $EXPECT_REDIRECT"
    return 1
  fi
  if [ "$LOCATION" != "$EXPECT_REDIRECT" ]; then
    WHY="redirects to '${LOCATION:-nowhere}', expected $EXPECT_REDIRECT"
    return 1
  fi
  WHY="redirects to $LOCATION"
}

# check <name> <url>: asks up to ATTEMPTS times, prints one result line.
check() {
  local name="$1" url="$2" n=1
  while :; do
    if "probe_$name"; then
      report "OK   $name  $url  status $STATUS  attempt $n of $ATTEMPTS: $WHY"
      return 0
    fi
    if [ "$n" -ge "$ATTEMPTS" ]; then
      report "FAIL $name  $url  status $STATUS  attempt $n of $ATTEMPTS: $WHY"
      return 1
    fi
    echo "     $name  $url  status $STATUS  attempt $n of $ATTEMPTS: $WHY; asking again in ${RETRY_DELAY}s"
    [ "$RETRY_DELAY" -gt 0 ] && sleep "$RETRY_DELAY"
    n=$((n + 1))
  done
}

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  echo "### Is the site up?" >>"$GITHUB_STEP_SUMMARY"
fi

failed=0
check www "$WWW_URL" || failed=1
check apex "$APEX_URL" || failed=1
exit "$failed"
