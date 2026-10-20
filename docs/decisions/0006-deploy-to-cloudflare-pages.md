# 0006. Deploy to Cloudflare Pages at calculator.issoufi.fr

- Date: 2026-10-20
- Status: Accepted

## Context

The demo of [0003](0003-deploy-to-github-pages-with-gh-pages.md) was blank: `homepage` still named the repository's old name, so the built page requested its assets under `/calculatrice/`, which answered 404. Deploying was a manual command, last run in 2018, and pull requests had no preview.

## Decision

Pull request #14 moved the hosting to Cloudflare Pages, at https://calculator.issoufi.fr:

- Cloudflare Pages builds `master` on every push with `npm run build`, and gives every other branch a preview URL;
- `homepage` is `.`, so the build loads its assets with relative paths and works from the root of any domain;
- the `gh-pages` package and the `predeploy` and `deploy` scripts are removed;
- `public/_headers` caches the hashed files under `/static/` for a year and revalidates the page on every visit.

The `gh-pages` branch now holds a page that redirects the old GitHub Pages URL to the new domain, keeping the path (#3).

## Alternatives considered

- Fixing `homepage` and staying on GitHub Pages: deployments would stay manual, with no preview per pull request and no control of the cache headers.
- Deploying from a GitHub Actions job: Cloudflare Pages builds the repository itself, so no deploy token has to be stored in GitHub.

## Consequences

- Every push to `master` deploys, and every pull request gets a preview.
- The build no longer depends on the repository name.
- On 2026-10-20, Lighthouse 12.8.2 in its mobile setting gave the production site 100 for performance, 90 for accessibility, 100 for best practices and 82 for SEO (see [the baseline](../evolution.md#current-baseline)).
- The build settings live in the Cloudflare dashboard, not in the repository; the README lists them.
