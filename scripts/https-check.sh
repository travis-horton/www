#!/usr/bin/env bash
# Does every site answer over HTTPS, and is each certificate good for a while
# yet? (26.1111, Praxis leaf 61cf3792, ruling M-609.)
#
#   bash scripts/https-check.sh travish.com www.travish.com kiddspazz.com
#
# Why it exists: the proxy in front of the sites (nginx-proxy) and the
# companion that gets their certificates (acme-companion) run on the floating
# `latest` tag on both servers, by Travis's choice (M-609). A new release
# arrives whenever a server re-creates them, with nothing tried beforehand.
# This is the "did the new one work?" question, asked from outside the way a
# visitor would. It runs after every deploy (deploy-to-dev.yml and
# deploy-to-prod.yml, last step) and once a week on its own
# (.github/workflows/https-check.yml).
#
# For each host given, two questions:
#   answer  https://<host>/ answers 2xx or 3xx, over a certificate curl
#           trusts for that name. Redirects are NOT followed: the bare
#           travish.com answers 301 by design. A handshake failure (no
#           certificate, a wrong one, an expired one) is curl's 000, a FAIL.
#   cert    the certificate the host sends expires more than
#           HTTPS_CHECK_MIN_DAYS days from now. acme-companion renews at
#           30 days left, so a certificate under 14 means renewal has been
#           failing for two weeks.
# The answer is asked up to HTTPS_CHECK_ATTEMPTS times,
# HTTPS_CHECK_RETRY_DELAY seconds apart, so a proxy still reloading after a
# deploy is not an alarm. The certificate is asked once (a date does not
# change in ten seconds). A refused connection or a timeout is a failed
# attempt, never a hang.
#
# A host may be written host:port (the tests use that); the default port is 443.
# Exit 0 only when every question about every host passed; 1 when any failed;
# 2 when it was called wrongly.
#
# Settings (environment):
#   HTTPS_CHECK_MIN_DAYS     14
#   HTTPS_CHECK_ATTEMPTS     3
#   HTTPS_CHECK_RETRY_DELAY  10   (seconds)
#   HTTPS_CHECK_CAFILE       (unset) a CA file to trust instead of the
#                            system's; only the tests set it
# When GITHUB_STEP_SUMMARY is set (inside GitHub Actions), the result lines are
# added to the run's summary page too.
#
# Needs only bash, curl and openssl. Its tests: scripts/https-check.test.js.
set -u

MIN_DAYS="${HTTPS_CHECK_MIN_DAYS:-14}"
ATTEMPTS="${HTTPS_CHECK_ATTEMPTS:-3}"
RETRY_DELAY="${HTTPS_CHECK_RETRY_DELAY:-10}"
CAFILE="${HTTPS_CHECK_CAFILE:-}"

# The uptime check's name, plus this script's. The site's visit log skips any
# User-Agent that starts with "travish-uptime-check " (nginx/nginx.conf), so
# these requests stay out of it too.
USER_AGENT='travish-uptime-check https-check (+https://github.com/travis-horton/www)'

case "$MIN_DAYS" in
  '' | *[!0-9]*) echo "HTTPS_CHECK_MIN_DAYS must be a whole number of days, not '$MIN_DAYS'" >&2; exit 2 ;;
esac
case "$ATTEMPTS" in
  '' | *[!0-9]* | 0) echo "HTTPS_CHECK_ATTEMPTS must be a whole number of 1 or more, not '$ATTEMPTS'" >&2; exit 2 ;;
esac
case "$RETRY_DELAY" in
  '' | *[!0-9]*) echo "HTTPS_CHECK_RETRY_DELAY must be a whole number of seconds, not '$RETRY_DELAY'" >&2; exit 2 ;;
esac
if [ "$#" -eq 0 ]; then
  echo "usage: bash scripts/https-check.sh <host>[:port] [<host>[:port] ...]" >&2
  exit 2
fi
for tool in curl openssl; do
  command -v "$tool" >/dev/null 2>&1 || { echo "https-check needs $tool, and it is not installed" >&2; exit 2; }
done

LIMIT=''
command -v timeout >/dev/null 2>&1 && LIMIT='timeout 20'

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

report() {
  echo "$1"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    echo "- \`$1\`" >>"$GITHUB_STEP_SUMMARY"
  fi
}

# The seconds since 1970 of an openssl date ("Jan  9 12:00:00 2027 GMT"):
# GNU date (the runner, the servers) or BSD date (a Mac). Empty when neither
# can read it.
epoch_of() {
  date -u -d "$1" +%s 2>/dev/null ||
    date -u -j -f '%b %e %H:%M:%S %Y %Z' "$1" +%s 2>/dev/null ||
    true
}

# answer <host> <port>: one GET of https://<host>:<port>/. Sets STATUS (000
# when nothing answered) and WHY.
answer() {
  local url="https://$1:$2/" out
  [ "$2" = 443 ] && url="https://$1/"
  WHY=''
  out="$(curl --silent --show-error --output /dev/null \
    --connect-timeout 10 --max-time 20 \
    --user-agent "$USER_AGENT" \
    ${CAFILE:+--cacert "$CAFILE"} \
    --write-out '%{http_code}' "$url" 2>"$WORK/error")"
  STATUS="${out:-000}"
  case "$STATUS" in
    2?? | 3??) WHY="answers $STATUS" ;;
    000) WHY="no answer ($(head -n 1 "$WORK/error" | tr -d '\r'))" ;;
    *) WHY="answers $STATUS, expected 2xx or 3xx" ;;
  esac
}

# check_answer <host> <port>: asks up to ATTEMPTS times; prints one result line.
check_answer() {
  local n=1
  while :; do
    answer "$1" "$2"
    case "$STATUS" in
      2?? | 3??)
        report "OK   $1  answer  $WHY (attempt $n of $ATTEMPTS)"
        return 0
        ;;
    esac
    if [ "$n" -ge "$ATTEMPTS" ]; then
      report "FAIL $1  answer  $WHY (attempt $n of $ATTEMPTS)"
      return 1
    fi
    echo "     $1  answer  $WHY (attempt $n of $ATTEMPTS); asking again in ${RETRY_DELAY}s"
    [ "$RETRY_DELAY" -gt 0 ] && sleep "$RETRY_DELAY"
    n=$((n + 1))
  done
}

# check_cert <host> <port>: reads the certificate the host sends for its own
# name (SNI), and fails when it expires within MIN_DAYS days.
check_cert() {
  local end end_s now_s days
  # </dev/null ends the TLS session at once. s_client's own exit status is not
  # trusted (it varies between versions); what counts is whether a
  # certificate came out.
  # `timeout` (GNU coreutils: the runner, the servers) stops a connection that
  # never answers; where it is missing (a Mac), the system's own connect
  # timeout does.
  $LIMIT openssl s_client -connect "$1:$2" -servername "$1" </dev/null >"$WORK/s_client" 2>"$WORK/s_error" || true
  if ! openssl x509 -noout -in "$WORK/s_client" >/dev/null 2>&1; then
    report "FAIL $1  cert    no certificate came back ($(grep -m 1 -iE 'error|refused|unable|errno' "$WORK/s_error" | tr -d '\r' || echo 'no reason given'))"
    return 1
  fi
  end="$(openssl x509 -noout -enddate -in "$WORK/s_client" | sed 's/^notAfter=//')"
  end_s="$(epoch_of "$end")"
  now_s="$(date -u +%s)"
  days='?'
  [ -n "$end_s" ] && days=$(((end_s - now_s) / 86400))
  # -checkend is openssl's own arithmetic: exit 0 when the certificate is still
  # good that many seconds from now. It decides; `days` is only for reading.
  if openssl x509 -noout -in "$WORK/s_client" -checkend $((MIN_DAYS * 86400)) >/dev/null 2>&1; then
    report "OK   $1  cert    expires $end ($days days left; the floor is $MIN_DAYS)"
    return 0
  fi
  report "FAIL $1  cert    expires $end ($days days left; the floor is $MIN_DAYS): the certificate is not being renewed (acme-companion renews at 30 days left)"
  return 1
}

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  echo "### Do the sites answer over HTTPS, with certificates good for $MIN_DAYS days or more?" >>"$GITHUB_STEP_SUMMARY"
fi

failed=0
for target in "$@"; do
  host="${target%%:*}"
  port=443
  [ "$host" != "$target" ] && port="${target#*:}"
  case "$port" in
    '' | *[!0-9]*) echo "not a port: '$port' in '$target'" >&2; exit 2 ;;
  esac
  check_answer "$host" "$port" || failed=1
  check_cert "$host" "$port" || failed=1
done

if [ "$failed" -ne 0 ]; then
  echo "HTTPS CHECK FAILED: at least one site above does not answer over HTTPS, or its certificate is close to expiring."
  echo "If the proxy or its certificate companion was just re-created on 'latest', the new release is the first suspect."
fi
exit "$failed"
