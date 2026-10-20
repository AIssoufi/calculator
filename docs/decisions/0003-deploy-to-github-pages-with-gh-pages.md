# 0003. Deploy the demo to GitHub Pages with gh-pages

- Date: 2018-04-26
- Status: Superseded by [0006](0006-deploy-to-cloudflare-pages.md)

## Context

The calculator is a static app: `npm run build` writes HTML, JavaScript and CSS files that any static host can serve. The demo needed a public URL.

## Decision

`3c14a66` added the `gh-pages` package and a `deploy` script (`gh-pages -d build`, after a `predeploy` build). It pushes the content of `build/` to the `gh-pages` branch, which GitHub Pages serves. `homepage` was set to `https://AIssoufi.github.io/calculatrice`, so the build loaded its assets under `/calculatrice/`.

## Alternatives considered

The commits record no other option. GitHub Pages needs no other account than the repository's, which is what the `gh-pages` package targets.

## Consequences

- Deploying is one manual command, run from a developer machine; nothing deploys on a push.
- The build depends on the repository name through `homepage`. When the repository was renamed from `calculatrice` to `calculator`, the assets answered 404 and the demo showed a blank page, until [0006](0006-deploy-to-cloudflare-pages.md).
