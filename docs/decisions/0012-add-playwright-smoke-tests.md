# 0012. Smoke test the production build in Chromium with Playwright

- Date: 2026-10-23
- Status: Accepted

## Context

Vitest runs the app tests in jsdom ([0009](0009-move-to-vitest.md)), on the source: jsdom does no layout, and no test loaded the production build in a browser. The CI only checked that `pnpm build` succeeds. The layout bugs of #8 and #34, keys covered or pushed out of a phone screen, and the keyboard check of #36 were found by hand, in a browser.

## Decision

The pull request of #42 added Playwright 1.64 (`@playwright/test`) and one smoke spec, `e2e/smoke.spec.ts`, run by `pnpm test:e2e`:

- [`playwright.config.js`](../../playwright.config.js) builds the app and serves it with `vite preview --strictPort` before the tests, on port 4173 unless `E2E_PORT` gives another one, and runs them in Chromium only. A port already taken fails the run, rather than testing whatever app answers on it;
- the spec types `2+3*4=` with the keyboard, then clicks the same keys, and expects `20`, the result that the README documents. Both tests wait for the screen to show before they press a key, since a key typed before the keydown listeners exist is lost (#36);
- the spec checks that each of the 19 keys is fully inside the viewport at 390x844, a phone, and 1280x800, a laptop;
- ESLint applies the typescript-eslint rules to `e2e/`, and `pnpm typecheck` checks it with `e2e/tsconfig.json`, which drops the global types of Vite and Vitest;
- the CI job "Install, lint, test and build" runs the smoke tests after the build. It caches the Chromium headless shell of Playwright in `~/.cache/ms-playwright`, under a key that holds the Playwright version, and downloads it only when the cache misses.

## Alternatives considered

- Cypress: its package downloads its own binary in a `postinstall` script, which pnpm runs only once listed in `allowBuilds`, where no dependency is listed today.
- The browser mode of Vitest: it runs the tests in a real browser, but on the source served by Vite, so it would not check the production build.
- Firefox and WebKit next to Chromium: each one adds its own download to the cache and its own run of every test, for a smoke test of the build.
- `playwright install --with-deps`: it installs the system libraries of the browser with apt on every run, since the cache does not keep them, while the image of `ubuntu-latest` already has those of Chromium.

## Consequences

- The CI now fails when the production build does not load, does not compute `2 + 3 × 4 =` with the keyboard or the mouse, or shows a key outside the viewport of a phone or a laptop.
- The job "Install, lint, test and build" took 40 s on `e44fdcf`, the base of the pull request (run 39738248551), and 45 s with the smoke tests on `8d13687`, the head of the pull request (run 39907529315).
- The headless shell and the FFmpeg build that Playwright downloads with it take 108 MB in the cache. When the cache misses, the job downloads them in about 4 s and saves them in about 3 s at its end; when it hits, it restores them in under 2 s and downloads nothing. A throwaway workflow of the pull request measured both cases and checked that a broken expectation fails the step (run 39906220675).
- The project has one more development dependency, `@playwright/test`, which brings `playwright` and `playwright-core`. The clean install takes 0.6 s before and 0.7 s after (medians of 3 runs, measured with the method of the [introduction of `docs/evolution.md`](../evolution.md#evolution)), and `pnpm audit` reports no advisory before or after.
- The 562 unit tests are unchanged (192 with the Node.js test runner, 370 in Vitest), and the 4 smoke tests run apart, with `pnpm test:e2e`.
- Firefox, WebKit and the other layouts, such as a phone in landscape (#34), are not tested in a browser.
