# 0008. Build the app with Vite

- Date: 2026-10-20
- Status: Accepted

## Context

Create React App ([0001](0001-bootstrap-with-create-react-app.md)) is no longer maintained. `react-scripts` 5.0.1 pinned an old webpack, Babel and Jest toolchain, which held most of the 99 vulnerable packages that `npm audit` reported on `master`, and its configuration could only be changed by ejecting.

## Decision

The pull request of #4 replaced `react-scripts` with Vite 8 and `@vitejs/plugin-react`:

- the page moved from `public/index.html` to the root `index.html`, which loads `src/index.jsx` as a module; the entry was renamed to `.jsx`, since Vite only transforms JSX in `.jsx` files;
- [`vite.config.js`](../../vite.config.js) keeps the build in `build/`, the output folder of the Cloudflare Pages project, and sets `base` to `./`, which replaces the `homepage` field: the page loads its assets with relative paths;
- Vite writes the hashed files under `build/assets/` instead of `build/static/`, so the long cache rule of `public/_headers` moved to `/assets/*`;
- `pnpm start`, `pnpm build` and `pnpm preview` run Vite; the `eject` script is gone;
- Create React App linted the code inside webpack with `eslint-config-react-app`: a flat [`eslint.config.js`](../../eslint.config.js) with the React and Rules of Hooks rules, the `pnpm lint` script and a CI step replace it.

## Alternatives considered

- Keeping Create React App: no fix will come for its advisories, and it holds React and Jest back.
- Ejecting Create React App: it hands over hundreds of lines of webpack and Babel configuration to maintain.
- Next.js: the app is a single static page with no server, routing or data fetching to justify a framework.
- Parcel or webpack set up by hand: Vite gives the same build with less configuration, and Vitest ([0009](0009-move-to-vitest.md)) reuses its settings.

## Consequences

Measured on 2026-10-20, in alternation with `6b36056`, the last commit with Create React App (see [the evolution](../evolution.md#2026-vite-vitest-pnpm-and-eslint)):

- the build went from 4.08 s to 0.23 s, and the dev server serves the page in 0.26 s instead of 3.17 s, though Vite compiles each module when the browser asks for it;
- the gzipped JavaScript went from 61,168 B to 60,829 B, and the gzipped CSS from 1,175 B to 1,080 B;
- with Jest gone too ([0009](0009-move-to-vitest.md)), the audit went from 99 vulnerable packages to 1 moderate advisory, in a dependency of Redux and Testing Library, then to none once the lockfile refreshed that dependency.

What it costs:

- The build targets the browsers of Baseline Widely available, Vite's default (Chrome and Edge 111, Firefox 114, Safari 16.4), where Create React App followed the `browserslist` query `>0.2%, not dead`: the CSS lost its `-webkit-` prefixes and the `100vh` fallback of `100dvh`.
- The build no longer writes source maps, `asset-manifest.json` or the license file of the bundle.
- Lighthouse's performance score went from 99 to 97 on the local build: Chrome fetches the module script at a high priority, and the simulated throttling counts its download before the first paint. The largest paint is unchanged.
- The Cloudflare Pages project needed no new output folder, but the cache rule of `public/_headers` follows the new `assets/` folder.
- ESLint 9 is no longer supported; the move to ESLint 10 waits for `eslint-plugin-react` (#22).
