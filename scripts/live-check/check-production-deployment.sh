#!/usr/bin/env bash
#
# Fails when the production deployment of a commit failed, which the site does not show: it keeps
# serving its previous build. Reads the Cloudflare Pages check run of the commit through the GitHub
# API. A build in progress and a commit without that check pass, since neither is a failed
# deployment, and so does any other conclusion, such as a cancelled build. The script exits 0 when
# the check passes, 1 when it fails or GitHub gives no readable answer, and 2 on a usage error. It
# needs curl and jq only, which macOS and the GitHub runners provide.
#
# Usage: [GITHUB_TOKEN=<token>] scripts/live-check/check-production-deployment.sh <owner/repo> <ref>
#   scripts/live-check/check-production-deployment.sh AIssoufi/calculator master
#   scripts/live-check/check-production-deployment.sh AIssoufi/calculator 4475253
#
# GITHUB_TOKEN is optional on a public repository, whose anonymous requests have a lower rate
# limit. GitHub Actions sets GITHUB_API_URL, which defaults to the API of github.com.

set -u

readonly CHECK_NAME='Cloudflare Pages'
readonly REQUEST_TIMEOUT_SECONDS=20
# curl retries a timeout and a 408, 429, 500, 502, 503 or 504 status, so a blip raises no alarm.
readonly REQUEST_RETRIES=2
readonly API_VERSION='2022-11-28'
# Cloudflare opens one check run per commit, never completes it, and adds a second one with the
# result. filter=latest keeps the second one alone; should the answer hold several runs all the
# same, the last one started counts.
readonly LATEST_RUN='.check_runs | max_by(.started_at)'
# The status code that curl prints when no answer came.
readonly NO_ANSWER='000'
readonly CHECK_FAILED=1
readonly USAGE_ERROR=2

exit_with_usage() {
  echo "Usage: $0 <owner/repo> <ref>" >&2
  exit "$USAGE_ERROR"
}

if [ "$#" -ne 2 ]; then
  exit_with_usage
fi
if ! [[ $1 =~ ^[^/[:space:]]+/[^/[:space:]]+$ ]]; then
  exit_with_usage
fi
# An empty or blank argument names no commit.
case $2 in
  *[![:space:]]*) ;;
  *) exit_with_usage ;;
esac

for tool in curl jq; do
  if ! command -v "$tool" > /dev/null; then
    echo "$0 needs $tool." >&2
    exit "$USAGE_ERROR"
  fi
done

repository=$1
ref=$2
api_url=${GITHUB_API_URL:-https://api.github.com}

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT
answer="$work_dir/answer"

# Prints the passed check. Argument: what was seen.
pass() {
  echo "ok   $CHECK_NAME of $ref: $1"
}

# Prints the failed check and stops; in GitHub Actions, the line also becomes an error annotation
# of the run. Argument: what was seen.
fail() {
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    printf '::error::'
  fi
  echo "FAIL $CHECK_NAME of $ref: $1"
  exit "$CHECK_FAILED"
}

# Requests the check runs of the commit and prints the status code. The body goes to the answer
# file and curl's error next to it. The token goes through stdin, out of the process list.
request_check_runs() {
  printf '%s\n' "${GITHUB_TOKEN:+Authorization: Bearer $GITHUB_TOKEN}" |
    curl --silent --show-error --max-time "$REQUEST_TIMEOUT_SECONDS" --retry "$REQUEST_RETRIES" \
      --get --data-urlencode "check_name=$CHECK_NAME" --data-urlencode 'filter=latest' \
      --header @- --header 'Accept: application/vnd.github+json' \
      --header "X-GitHub-Api-Version: $API_VERSION" \
      --output "$answer" --write-out '%{http_code}' \
      "${api_url%/}/repos/$repository/commits/$ref/check-runs" 2> "$answer.error"
}

# Prints what the check is at: "absent", the conclusion of a completed run, or the status of a
# running one.
read_check_state() {
  jq -r "if .check_runs == [] then \"absent\" else $LATEST_RUN | .conclusion // .status end" \
    "$answer" 2> /dev/null
}

status=$(request_check_runs)
if [ "$status" = "$NO_ANSWER" ]; then
  fail "no answer from GitHub, $(head -n 1 "$answer.error")"
fi
if [ "$status" != 200 ]; then
  fail "GitHub answered $status"
fi

# jq prints nothing for an empty body, and null for a run without a status.
if ! state=$(read_check_state) || [ -z "$state" ] || [ "$state" = null ]; then
  fail 'GitHub gave an unreadable answer'
fi

case $state in
  failure)
    fail "failure on $(jq -r "$LATEST_RUN | \"\(.head_sha), see \(.details_url)\"" "$answer")"
    ;;
  absent) pass 'no such check on this commit' ;;
  *) pass "$state" ;;
esac
