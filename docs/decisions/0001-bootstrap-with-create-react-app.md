# 0001. Bootstrap the app with Create React App

- Date: 2018-04-19
- Status: Superseded by [0008](0008-move-to-vite.md)

## Context

The project started as a single-page calculator written in React. A React app needs a bundler, a JSX and modern JavaScript compiler, a development server and a test runner before the first component can run.

## Decision

The first commit (`713dea3`) generated the app with Create React App: `react-scripts` 1.1.4 with React 16.3. The `start`, `build` and `test` scripts call `react-scripts`, which hides the webpack, Babel and Jest configuration. `c471932` laid out the calculator as a static page, and `05ff2f9` split it into components.

In 2023, `8cb228d` upgraded `react-scripts` to 5.0.1 and React to 18.2, and kept Create React App.

## Alternatives considered

The commits record no other option. Writing the webpack and Babel configuration by hand was the other common setup in 2018; it gives full control of the build, at the cost of a configuration to write and keep up to date.

## Consequences

- One dependency, `react-scripts`, brings the whole toolchain, and the project has no build configuration file.
- The configuration can only be changed by ejecting (`npm run eject`), which the project never did.
- Create React App is no longer maintained, and `npm audit` reports 99 vulnerable packages on `master` on 2026-10-20 (see [the baseline](../evolution.md#baseline-of-the-npm-eras)).
