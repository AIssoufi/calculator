# 0017. Check the production site from a scheduled workflow

- Date: 2026-10-24
- Status: Accepted

## Context

The CI proves a commit, not the site that visitors reach: nothing noticed a failed deployment, a wrong header or a broken asset in production (#62).

## Decision

`.github/workflows/live-check.yml` runs on a cron of `17 * * * *` and by hand. Its step runs `scripts/live-check/check-live-site.sh`, with `curl` and `jq` and nothing to install, which checks on `calculator.issoufi.fr`:

- the status 200 and the title of the page;
- the Content-Security-Policy header;
- the hashed script and stylesheet the page names;
- the manifest, which must be valid JSON;
- the status 404 of an unknown path.

The script has its Node.js tests, against a fake site.

The site alone cannot show a failed deployment: Cloudflare Pages keeps serving the previous build, so the commit `4475253`, whose deployment failed on 2026-10-28, was followed by 17 green runs up to 2026-11-01. A second step, `scripts/live-check/check-production-deployment.sh`, now reads the `Cloudflare Pages` check run of the head of `master` through the GitHub API with the workflow token and `checks: read` (#97). It fails on a `failure` or on an answer it cannot read, and passes on a success, a deployment in progress, any other conclusion, or no check at all.

## Alternatives considered

- An external monitor: it would run on a steady cadence and alert by itself, but it needs an account and a choice that #81 leaves to the owner.
- Checking once after each deployment: it would miss what breaks between two deployments.

## Consequences

- GitHub delays and drops scheduled runs, so this is a periodic check, not continuous monitoring: the runs are hours apart, with no fixed rhythm (#81).
- A scheduled run took 7 to 11 s before the deployment step, over its last 15 runs, and costs no install.
- A failed deployment stays red until a later deployment of `master` succeeds, even though the site still works.
