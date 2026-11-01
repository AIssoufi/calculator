# 0019. Test the accessibility of the build with axe

- Date: 2026-10-28
- Status: Accepted

## Context

An accessibility regression only showed in a manual audit: the repository audit of 2026-10-28 found the `region` violation of #80, not the CI (#86). The Playwright suite of [0012](0012-add-playwright-smoke-tests.md) already served the production build in Chromium.

## Decision

`e2e/accessibility.spec.ts` runs `@axe-core/playwright` 4.14 on `/` and on `/404.html`, at 390x844 and 1280x800, the `VIEWPORTS` shared in `e2e/constants.ts`:

- the tags are `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and `best-practice`. `wcag21a` holds `label-content-name-mismatch`, and axe 4.14 has no `wcag22a` tag;
- no rule is excluded;
- a failure names the rule, its impact and the selectors.

## Alternatives considered

- Lighthouse in the CI: it needs Chrome, a server and thresholds of its own, and runs a subset of the rules of axe.
- `eslint-plugin-jsx-a11y` alone: it reads the source, not the rendered page, so it cannot see contrast or landmarks.

## Consequences

- The package adds two entries to the lockfile, itself and `axe-core`.
- The test detects a real problem: with the fix of #85 reverted, the calculator fails at both widths with `region (moderate): h1`.
- axe finds a part of the accessibility problems only, so it does not replace a keyboard or screen reader test.
- The end-to-end suite goes from 3.1 s to 4.9 s on one worker.
