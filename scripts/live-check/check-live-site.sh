#!/usr/bin/env bash
#
# Checks a deployment of the calculator from outside, as a browser reaches it: the home page with
# its title and its Content-Security-Policy header, the hashed script and stylesheet it loads, the
# web app manifest, and the 404 status of a path that matches no file. Each check prints one line
# that names it. The script exits 0 when every check passes, 1 when one fails, and 2 on a usage
# error. It needs curl and jq only, which macOS and the GitHub runners provide.
#
# Usage: scripts/live-check/check-live-site.sh <URL or host>
#   scripts/live-check/check-live-site.sh https://calculator.issoufi.fr
#   scripts/live-check/check-live-site.sh <preview>.calculator-1x0.pages.dev   # adds https://

set -u

readonly EXPECTED_TITLE='<title>Calculatrice</title>'
# Matches no file of the build, so Cloudflare Pages must answer it with public/404.html.
readonly UNKNOWN_PATH='/does-not-exist'
readonly REQUEST_TIMEOUT_SECONDS=20
# curl retries a timeout and a 408, 429, 500, 502, 503 or 504 status, so a blip raises no alarm.
readonly REQUEST_RETRIES=2
# The length of the start of a body that a failed check of its content shows.
readonly BODY_EXCERPT_BYTES=60
# The status code that curl prints when no answer came.
readonly NO_ANSWER='000'
readonly CHECK_FAILED=1
readonly USAGE_ERROR=2

exit_with_usage() {
  echo "Usage: $0 <URL or host>" >&2
  exit "$USAGE_ERROR"
}

if [ "$#" -ne 1 ]; then
  exit_with_usage
fi
# An empty or blank argument names no host.
case $1 in
  *[![:space:]]*) ;;
  *) exit_with_usage ;;
esac

for tool in curl jq; do
  if ! command -v "$tool" > /dev/null; then
    echo "$0 needs $tool." >&2
    exit "$USAGE_ERROR"
  fi
done

base_url=$1
case $base_url in
  # curl reads a scheme in any case, as browsers do.
  [Hh][Tt][Tt][Pp]://* | [Hh][Tt][Tt][Pp][Ss]://*) ;;
  # Another scheme, such as ftp://, would end up in the path of an https:// URL.
  *://*) exit_with_usage ;;
  *) base_url="https://$base_url" ;;
esac
base_url=${base_url%/}

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT

passed=0
failed=0

# Prints a passed check. Argument: the name of the check.
pass() {
  passed=$((passed + 1))
  echo "ok   $1"
}

# Prints a failed check with what was seen instead; in GitHub Actions, the line also becomes an
# error annotation of the run. Arguments: the name of the check, what was seen.
fail() {
  failed=$((failed + 1))
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    printf '::error::'
  fi
  echo "FAIL $1: $2"
}

# Requests a path of the site without following redirects, and prints its status code. The body,
# the headers and curl's error go to <answer>.body, <answer>.headers and <answer>.error in the work
# directory. Arguments: the path, the name of the answer.
request() {
  local answer="$work_dir/$2"

  : > "$answer.body"
  : > "$answer.headers"
  curl --silent --show-error --max-time "$REQUEST_TIMEOUT_SECONDS" --retry "$REQUEST_RETRIES" \
    --output "$answer.body" --dump-header "$answer.headers" --write-out '%{http_code}' \
    "$base_url$1" 2> "$answer.error"
}

# Requests a path and checks its status code. Arguments: the name of the check, the path, the
# expected status code, the name of the answer (see request).
expect_status() {
  local check=$1 status

  status=$(request "$2" "$4")
  if [ "$status" = "$3" ]; then
    pass "$check"
  elif [ "$status" = "$NO_ANSWER" ]; then
    fail "$check" "no answer, $(head -n 1 "$work_dir/$4.error")"
  else
    fail "$check" "got $status"
  fi
}

# Checks that the home page references at least one hashed index file with the given extension,
# and that each one answers 200. Arguments: the extension, the kind of file shown in the checks.
expect_assets() {
  local extension=$1 kind=$2 assets asset

  assets=$(grep -oE "assets/index-[A-Za-z0-9_-]+\\.$extension" "$work_dir/home.body" | sort -u)
  if [ -z "$assets" ]; then
    fail "home page references a $kind" "no assets/index-*.$extension in the page"
    return
  fi
  for asset in $assets; do
    expect_status "$kind $asset answers 200" "/$asset" 200 asset
  done
}

# Describes the start of a body on one line, for a failed check of its content. Argument: the
# name of the answer.
describe_body() {
  local body="$work_dir/$1.body"

  if [ ! -s "$body" ]; then
    echo 'the body is empty'
    return
  fi
  echo "the body starts with $(head -c "$BODY_EXCERPT_BYTES" "$body" | tr -s '\r\n\t' ' ')"
}

# Describes the title that the home page holds instead of the expected one, or the start of its
# body when it holds none.
describe_home_title() {
  local title

  title=$(grep -oE '<title>[^<]*</title>' "$work_dir/home.body" | head -n 1)
  if [ -z "$title" ]; then
    describe_body home
    return
  fi
  echo "the page holds $title"
}

echo "Checking $base_url"

expect_status 'home page answers 200' / 200 home

if grep -qF "$EXPECTED_TITLE" "$work_dir/home.body"; then
  pass "home page holds $EXPECTED_TITLE"
else
  fail "home page holds $EXPECTED_TITLE" "$(describe_home_title)"
fi

# A header line with a value: the name is case-insensitive, and the line ends with a carriage
# return.
if grep -qiE '^content-security-policy:[[:space:]]*[^[:space:]]' "$work_dir/home.headers"; then
  pass 'home page sends a Content-Security-Policy header'
else
  fail 'home page sends a Content-Security-Policy header' 'no such header, or an empty one'
fi

expect_assets js script
expect_assets css stylesheet

expect_status 'manifest.json answers 200' /manifest.json 200 manifest

if jq -e 'type == "object"' "$work_dir/manifest.body" > /dev/null 2>&1; then
  pass 'manifest.json is a JSON object'
else
  fail 'manifest.json is a JSON object' "$(describe_body manifest)"
fi

expect_status "$UNKNOWN_PATH answers 404" "$UNKNOWN_PATH" 404 unknown

if [ "$failed" -gt 0 ]; then
  echo "$failed of $((passed + failed)) checks failed on $base_url"
  exit "$CHECK_FAILED"
fi
echo "All $passed checks passed on $base_url"
