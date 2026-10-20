# 0009. Run the tests with Vitest

- Date: 2026-10-20
- Status: Accepted

## Context

`react-scripts test` ran the app tests with the Jest 27 and Babel configuration of Create React App, which the project could not change without ejecting. The tests used Testing Library 13 for React and user-event 13, which pulled two copies of `@testing-library/dom`, and the CI printed "A worker process has failed to exit gracefully and has been force exited" after the tests of `master` (run 39391773544). Once Vite builds the app ([0008](0008-move-to-vite.md)), keeping Jest would also mean keeping a Babel setup that the build no longer uses.

## Decision

The pull request of #4 replaced Jest with Vitest 5:

- Vitest reads its settings from the `test` key of `vite.config.js`, so the tests transform the code the way the build does, and run in jsdom with the globals (`describe`, `it`, `expect`, `vi`) that let Testing Library clean the DOM up after each test;
- `src/setupTests.js` loads the jest-dom matchers through `@testing-library/jest-dom/vitest`, and `jest.fn()` became `vi.fn()`;
- Testing Library for React went to 16 and user-event to 14, with a single `@testing-library/dom` 10; the app tests set user-event up before the render and await each click;
- the Testing Library packages moved to the development dependencies;
- `pnpm test` still runs the tests of the commit tooling first, with the Node.js test runner, then `vitest run`; `pnpm test:watch` starts the watch mode.

## Alternatives considered

- Jest without Create React App: it needs its own Babel or SWC transform for JSX, next to the Vite one, and a second module resolution to keep in sync.
- The Node.js test runner for the app tests too: it has no DOM environment and no JSX transform, so it would need jsdom and a loader set up by hand.

## Consequences

- The same 451 tests pass: 187 with the Node.js test runner, and the 264 app tests in Vitest instead of Jest.
- The tests and the build share one transform, the Vite one, and the project has no Babel configuration left.
- One `@testing-library/dom`, 10.4.2, replaces versions 9.3.1 and 8.20.1.
- Measured on 2026-10-20 in alternation with `6b36056`, `pnpm test` takes 3.94 s where `npm test` took 3.26 s: Vitest reports that setting jsdom up for the 9 test files takes about 70% of its run.
- The CI log of the pull request of #4 (run 39395917112) no longer shows the warning "A worker process has failed to exit gracefully".
