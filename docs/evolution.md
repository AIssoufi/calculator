# Evolution

How the project's stack changed, era by era, oldest first. Each tool change has its Architecture Decision Record in [`decisions/`](decisions/).

The figures of the npm eras were measured on 2026-10-20 from the last commit of each era, rebuilt in a detached worktree with the method of the [baseline of the npm eras](#baseline-of-the-npm-eras); the Vite and TypeScript eras use the method of the [baseline of the TypeScript era](#baseline-of-the-typescript-era-5), and the later eras were measured by a measuring tool kept outside the repository, as each of their sections tells. That tool times and runs the commands of the [baseline of the TypeScript era](#baseline-of-the-typescript-era-5), with the differences named below, so each figure can be measured again by hand: it checks out the Before and the After commits in detached worktrees on the same machine and measures them in alternation, three runs of each figure, and gives the median first, then the three runs. It times `pnpm install --frozen-lockfile` after deleting `node_modules`, `pnpm build` after deleting `build/` but keeping `node_modules/.vite`, the start of `vite` until it serves the page, and `pnpm test`; it reads the raw and gzipped sizes of the script and the stylesheet of `build/assets/` with `wc -c` and `gzip -c <file> | wc -c`, the number of tests from the summaries of the Node.js test runner, Vitest and Playwright, the direct dependencies from the keys of `package.json`, the advisories from `pnpm audit --json`, and the four scores of Lighthouse on `build/` served locally with its default mobile settings. The CI durations come from the run of each pull request, or of the push of the Before commit to `master`, from `createdAt` to `updatedAt` in `gh run view`, and the job times from the jobs of that run. The [current state](#current-state) gives today's figures. Each table compares the last commit of the previous era (Before) with the last commit of the era (After). `npm audit` and `pnpm audit` read today's advisory database, so they count what is known to be vulnerable today, not what was known at the time.

## 2018: a Create React App with Redux, on GitHub Pages

The calculator was generated with Create React App, split into components, then wired to a Redux store. A manual `npm run deploy` published the build to GitHub Pages with the `gh-pages` package. The project had no test and no CI.

Last commit: `ba770d8` (2018-04-27).

| Figure                                                             | Before     | After                                      |
| ------------------------------------------------------------------ | ---------- | ------------------------------------------ |
| Stack                                                              | no project | `react-scripts` 1.1.4, React 16.3, Redux 4 |
| Install time (`npm ci`)                                            | no project | 4.19 s                                     |
| Build time (`npm run build`)                                       | no project | 2.32 s                                     |
| JavaScript, raw / gzipped                                          | no project | 162,560 B / 50,222 B                       |
| CSS, raw / gzipped                                                 | no project | 2,689 B / 1,024 B                          |
| Direct dependencies                                                | no project | 6                                          |
| `npm audit` vulnerable packages (low / moderate / high / critical) | no project | 15 / 74 / 109 / 106 (304)                  |
| Tests                                                              | no project | 0                                          |
| Lighthouse                                                         | no project | not measured                               |

Decisions:

- [0001. Bootstrap the app with Create React App](decisions/0001-bootstrap-with-create-react-app.md)
- [0002. Manage the calculator state with Redux](decisions/0002-manage-state-with-redux.md)
- [0003. Deploy the demo to GitHub Pages with gh-pages](decisions/0003-deploy-to-github-pages-with-gh-pages.md)

## 2023: English names, React 18 and Redux Toolkit

The dependencies from 2018 were five years old. The components and variables were renamed in English, React, React Redux and `react-scripts` were upgraded, and the Redux code moved to Redux Toolkit slices. `yarn.lock` was removed, leaving npm and `package-lock.json` alone.

Last commit: `59102ea` (2023-08-06).

| Figure                                                             | Before                                     | After                                                |
| ------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------- |
| Stack                                                              | `react-scripts` 1.1.4, React 16.3, Redux 4 | `react-scripts` 5.0.1, React 18.2, Redux Toolkit 1.9 |
| Install time (`npm ci`)                                            | 4.19 s                                     | 4.90 s                                               |
| Build time (`npm run build`)                                       | 2.32 s                                     | 4.56 s                                               |
| JavaScript, raw / gzipped                                          | 162,560 B / 50,222 B                       | 187,013 B / 60,650 B                                 |
| CSS, raw / gzipped                                                 | 2,689 B / 1,024 B                          | 2,417 B / 992 B                                      |
| Direct dependencies                                                | 6                                          | 10                                                   |
| `npm audit` vulnerable packages (low / moderate / high / critical) | 15 / 74 / 109 / 106 (304)                  | 14 / 48 / 34 / 6 (102)                               |
| Tests                                                              | 0                                          | 0                                                    |
| Lighthouse                                                         | not measured                               | not measured                                         |

Decision: [0004. Move the Redux code to Redux Toolkit](decisions/0004-move-to-redux-toolkit.md)

## 2026: CI, Cloudflare Pages and a tested engine

The GitHub Pages demo was blank since the repository's rename, and nothing checked a change before its merge. A GitHub Actions workflow now installs, tests and builds every pull request (#13). The app is deployed by Cloudflare Pages at https://calculator.issoufi.fr, and the old URL redirects there (#14). The calculator logic moved into a pure, tested engine, `src/features/calculator/engine.js`, which fixed chained, zero and decimal input (#15), and the phone layout was fixed (#18). commitlint and husky now check every commit message (#19).

Last commit measured: `8c6bd3d` (2026-10-20), the [baseline of the npm eras](#baseline-of-the-npm-eras). The component clean-up of #21 followed, up to `6b36056`.

| Figure                                                             | Before                                               | After                                                                  |
| ------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Stack                                                              | `react-scripts` 5.0.1, React 18.2, Redux Toolkit 1.9 | unchanged, plus GitHub Actions, Cloudflare Pages, commitlint and husky |
| Install time (`npm ci`)                                            | 4.90 s                                               | 5.73 s                                                                 |
| Build time (`npm run build`)                                       | 4.56 s                                               | 3.62 s                                                                 |
| JavaScript, raw / gzipped                                          | 187,013 B / 60,650 B                                 | 188,515 B / 61,179 B                                                   |
| CSS, raw / gzipped                                                 | 2,417 B / 992 B                                      | 3,050 B / 1,186 B                                                      |
| Direct dependencies                                                | 10                                                   | 14 (9 + 5 development)                                                 |
| `npm audit` vulnerable packages (low / moderate / high / critical) | 14 / 48 / 34 / 6 (102)                               | 14 / 47 / 33 / 5 (99)                                                  |
| Tests                                                              | 0                                                    | 445                                                                    |
| CI duration                                                        | no CI                                                | 45 s                                                                   |
| Lighthouse (mobile)                                                | not measured                                         | 100 / 90 / 100 / 82                                                    |

Decisions:

- [0005. Check every pull request with GitHub Actions](decisions/0005-run-ci-with-github-actions.md)
- [0006. Deploy to Cloudflare Pages at calculator.issoufi.fr](decisions/0006-deploy-to-cloudflare-pages.md), which supersedes 0003
- [0007. Lint commit messages with commitlint and husky](decisions/0007-lint-commit-messages-with-commitlint.md)

## 2026: Vite, Vitest, pnpm and ESLint

Create React App was no longer maintained, and its toolchain held almost every audit advisory of the project. Vite now builds the app and serves it in development, Vitest runs the app tests with Testing Library 16 and user-event 14, pnpm installs the dependencies, and ESLint lints the code in the CI (#4). The app is unchanged: the same tests pass, and the page looks the same.

The Before column is `6b36056`, the last commit of the previous era, measured in alternation with the After column on the same machine, so that the load of the machine weighs on both alike.

| Figure                                   | Before                                                 | After                                            |
| ---------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Stack                                    | `react-scripts` 5.0.1 (webpack 5, Babel, Jest 27), npm | Vite 8.3, Vitest 5.0, pnpm 12.14, ESLint 9.39    |
| Install time                             | 5.89 s (`npm ci`)                                      | 0.94 s (`pnpm install --frozen-lockfile`)        |
| Build time                               | 4.08 s (`npm run build`)                               | 0.23 s (`pnpm build`)                            |
| Dev server start                         | 3.17 s (`npm start`)                                   | 0.26 s (`pnpm start`)                            |
| JavaScript, raw / gzipped                | 188,498 B / 61,168 B                                   | 184,646 B / 60,829 B                             |
| CSS, raw / gzipped                       | 3,036 B / 1,175 B                                      | 2,733 B / 1,080 B                                |
| Direct dependencies                      | 14 (9 + 5 development)                                 | 23 (5 + 18 development)                          |
| Audit (low / moderate / high / critical) | `npm audit`: 14 / 47 / 33 / 5 (99 packages)            | `pnpm audit`: 0 / 1 / 0 / 0 (1 advisory), then 0 |
| Tests                                    | 451: 187 Node.js test runner, 264 Jest                 | 451: 187 Node.js test runner, 264 Vitest         |
| Test suite time                          | 3.26 s                                                 | 3.94 s                                           |
| CI duration                              | 29 s                                                   | 30 s, with the lint step added                   |
| Lighthouse (mobile, local build)         | 99 / 90 / 100 / 90                                     | 97 / 90 / 100 / 90                               |

- The build is more than ten times faster, and its hashed files moved from `build/static/` to `build/assets/`. The dev server starts faster too, though Vite compiles each module when the browser asks for it, where webpack compiled the whole app before serving it.
- The test suite takes 0.7 s longer: Vitest reports that setting jsdom up for the 9 test files takes about 70% of its run.
- Lighthouse's performance score went from 99 to 97: Chrome fetches the module script of Vite at a high priority, where the deferred script of Create React App had a low one, and the simulated throttling of Lighthouse counts its download before the first paint (0.75 s before, 1.80 s after). The largest paint is unchanged, at 2.25 s.
- The CSS lost its `-webkit-` prefixes and the `100vh` fallback of `100dvh`: the build targets the browsers of [Baseline Widely available](https://web.dev/baseline) (Chrome and Edge 111, Firefox 114, Safari 16.4), where Create React App followed the `browserslist` query `>0.2%, not dead`.
- After the migration, `pnpm audit` reported one moderate advisory, in `@babel/runtime`, a dependency of Redux and Testing Library. The last commit of the pull request refreshed that transitive dependency in the lockfile, which brings the advisories to 0.

Decisions:

- [0008. Build the app with Vite](decisions/0008-move-to-vite.md), which supersedes 0001
- [0009. Run the tests with Vitest](decisions/0009-move-to-vitest.md)
- [0010. Install the dependencies with pnpm](decisions/0010-move-to-pnpm.md)

## 2026: TypeScript

The app was written in JavaScript, and nothing checked the state, the action payloads or the props that cross its modules. Every file of `src/` is now written in TypeScript, checked in strict mode by `pnpm typecheck` in the CI, with typed Redux actions and typed hooks to read and update the store (#5). The app is unchanged: the same tests pass, and the page looks the same.

The Before column is `9aeb689`, the last commit of the previous era, measured in alternation with the After column on the same machine. Other builds loaded the machine during the runs (a load average of 13 to 17 on 8 cores), so the times are higher than those of the previous era: compare the two columns of this table, not the eras.

| Figure                           | Before                                                    | After                                                                     |
| -------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Stack                            | JavaScript, Vite 8.3, Vitest 5.0, pnpm 12.14, ESLint 9.39 | TypeScript 6.0 in strict mode, typescript-eslint 8.71; the rest unchanged |
| Install time                     | 0.93 s                                                    | 1.63 s                                                                    |
| Build time                       | 0.28 s                                                    | 0.40 s                                                                    |
| Dev server start                 | 0.38 s                                                    | 0.52 s                                                                    |
| Type check time                  | no type check                                             | 1.19 s (`pnpm typecheck`)                                                 |
| Lint time                        | 0.95 s                                                    | 1.97 s                                                                    |
| JavaScript, raw / gzipped        | 184,646 B / 60,829 B                                      | 184,748 B / 60,919 B                                                      |
| CSS, raw / gzipped               | 2,733 B / 1,080 B                                         | 2,733 B / 1,080 B                                                         |
| Direct dependencies              | 23 (5 + 18 development)                                   | 27 (5 + 22 development)                                                   |
| Audit (`pnpm audit`)             | 0 advisories                                              | 0 advisories                                                              |
| Tests                            | 451: 187 Node.js test runner, 264 Vitest                  | 454: 187 Node.js test runner, 267 Vitest                                  |
| Test suite time                  | 6.00 s                                                    | 7.23 s                                                                    |
| CI duration                      | 23 s                                                      | 33 s, with the type check step added (1 s)                                |
| Lighthouse (mobile, local build) | 97 / 90 / 100 / 90                                        | 97 / 90 / 100 / 90                                                        |

- Vite and Vitest strip the types without checking them, so the build, the dev server and the tests do the same work as before; their runs overlap from one column to the other. The test suite has 2 more files, for the typed hooks, and Vitest sets jsdom up for each one.
- The CI runs the type check, a new step, and the lint takes twice as long, since typescript-eslint parses each file with the TypeScript parser.
- The script grows by 102 B, the error that `src/index.tsx` throws when the page has no `#root` element: the types themselves leave nothing in the build.
- The install takes longer: typescript-eslint adds 17 packages, and TypeScript 6.0, a JavaScript package, replaces the native binary of TypeScript 7.0 that the configuration loader of commitlint pulled before.

Decision: [0011. Write the app in TypeScript, in strict mode](decisions/0011-move-to-typescript.md)

## 2026: React 19, Redux Toolkit 2 and React Redux 9

React, Redux Toolkit and React Redux were a major version behind. React and React DOM moved to 19.3, Redux Toolkit to 2.13 and React Redux to 9.3, and the direct `redux` dependency was removed, since Redux Toolkit brings Redux 5 itself (#6). The typed hooks of the store now use the `withTypes` API of React Redux 9. The app is unchanged: the same tests pass, without new warnings, and the page looks the same.

The Before column is `3fa976a`, the last commit of the previous era, measured on 2026-10-21 in alternation with the After column on the same machine, with the measuring tool and the method of the [introduction](#evolution).

| Figure                           | Before                                                  | After                                                                                                                      |
| -------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Stack                            | React 18.2, Redux Toolkit 1.9, React Redux 8.1, Redux 4 | React 19.3, Redux Toolkit 2.13, React Redux 9.3 (Redux 5 through Redux Toolkit)                                            |
| Install time                     | 0.9 s (0.9, 0.9, 1.1)                                   | 1.0 s (1.0, 0.9, 1.1)                                                                                                      |
| Build time                       | 0.2 s (2.0, 0.2, 0.2)                                   | 0.2 s (1.4, 0.2, 0.2)                                                                                                      |
| Dev server start                 | 0.2 s (0.2, 0.2, 0.2)                                   | 0.2 s (0.2, 0.2, 0.2)                                                                                                      |
| JavaScript, raw / gzipped        | 184,748 B / 60,946 B                                    | 253,823 B / 80,752 B                                                                                                       |
| CSS, raw / gzipped               | 2,733 B / 1,063 B                                       | 2,733 B / 1,063 B                                                                                                          |
| Direct dependencies              | 27 (5 + 22 development)                                 | 26 (4 + 22 development)                                                                                                    |
| Audit (`pnpm audit`)             | 0 advisories                                            | 0 advisories                                                                                                               |
| Tests                            | 454                                                     | 454                                                                                                                        |
| Test suite time                  | 3.9 s (3.9, 7.9, 2.3)                                   | 4.3 s (5.8, 4.3, 2.3)                                                                                                      |
| CI duration                      | 33 s                                                    | 29 s, of which 27 s for the job that lints, checks the types, tests and builds (run 39554036750 of the pull request of #6) |
| Lighthouse (mobile, local build) | 97 / 90 / 100 / 90                                      | 95 / 90 / 100 / 90                                                                                                         |

- The script grows by 69,075 B raw and 19,806 B gzipped, mostly from React DOM 19: its share of the mapped code of the source map goes from 72% to 83%, while Redux Toolkit 2 and React Redux 9 shrink and drop `@babel/runtime`, `hoist-non-react-statics` and `react-is` from the build.
- Lighthouse's performance score goes from 97 to 95 (runs 98, 97, 97 before; 95, 95, 96 after): the simulated throttling of Lighthouse downloads and parses the larger script before the first paint.
- The install, build, dev server and test times overlap from one column to the other.

## 2026: smoke tests of the production build in Chromium

The unit tests run in jsdom, which does no layout, so the layout bugs of #8 and #34 were found by hand. Playwright 1.64 now runs 4 smoke tests in Chromium against the production build served by `vite preview`, locally with `pnpm test:e2e` and on every pull request (#42).

The Before column is `e44fdcf`, the base of the pull request, measured on 2026-10-23 in alternation with the After column on the same machine, with the measuring tool and the method of the [introduction](#evolution).

| Figure               | Before                                                                                           | After                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack                | React 19.3, Redux Toolkit 2.13, React Redux 9.3                                                  | unchanged, plus Playwright 1.64 with the Chromium headless shell                                                                                  |
| Install time         | 0.6 s (0.6, 0.6, 0.6)                                                                            | 0.7 s (0.7, 0.7, 0.6)                                                                                                                             |
| Direct dependencies  | 26 (4 + 22 development)                                                                          | 27 (4 + 23 development)                                                                                                                           |
| Audit (`pnpm audit`) | 0 advisories                                                                                     | 0 advisories                                                                                                                                      |
| Tests                | 562: 192 Node.js test runner, 370 Vitest                                                         | the same 562, plus 4 smoke tests in Chromium                                                                                                      |
| CI duration          | 43 s, of which 40 s for the job that lints, checks the types, tests and builds (run 39738248551) | 49 s, of which 45 s for the job that lints, checks the types, tests, builds and runs the smoke tests (run 39907529315 of the pull request of #42) |

- The CI caches the 108 MB of the headless shell and its FFmpeg build under the Playwright version: a miss downloads them in about 4 s, a hit restores them in under 2 s.
- The build, its size and the unit tests are unchanged: Playwright is a development dependency that the app does not import.

Decision: [0012. Smoke test the production build in Chromium with Playwright](decisions/0012-add-playwright-smoke-tests.md)

## 2026: Prettier formats every file

ESLint checked no layout, so stray spaces and mixed indents passed the CI (#44). Prettier 3.9 now formats the code and the docs, `pnpm format:check` fails the CI on a file it would format, and one commit, skipped by `git blame`, formatted the whole repository (#55).

The Before column is `c0b6363`, the base of the pull request, measured on 2026-10-28 in alternation with the After column on the same machine, with the measuring tool and the method of the [introduction](#evolution).

| Figure               | Before                                   | After                                                     |
| -------------------- | ---------------------------------------- | --------------------------------------------------------- |
| Stack                | no formatter                             | Prettier 3.9, and `eslint-config-prettier` last in ESLint |
| Install time         | 0.5 s (0.6, 0.5, 0.5)                    | 0.5 s (0.5, 0.5, 0.6)                                     |
| Direct dependencies  | 27 (4 + 23 development)                  | 29 (4 + 25 development)                                   |
| Audit (`pnpm audit`) | 0 advisories                             | 0 advisories                                              |
| `pnpm format:check`  | no such check                            | 0.6 s (0.7, 0.6, 0.6)                                     |
| Tests                | 636: 221 Node.js test runner, 415 Vitest | the same 636                                              |
| CI duration          | see the pull request of #55              | see the pull request of #55                               |

- The formatting commit changed 71 files, with 1,198 lines added and 929 removed; the build, its size (255,867 B raw and 81,629 B gzipped for the script, before and after) and the tests are unchanged.
- `pnpm format:check` was timed apart, with `/usr/bin/time -p`, on the After only.

Decision: [0013. Format the code and the docs with Prettier](decisions/0013-add-prettier.md)

## 2026: Node.js 26

Node.js 24 entered maintenance on 2026-10-20, and Node.js 26 became the Active LTS on 2026-10-28. `.nvmrc` now holds `26`, which the CI and the Cloudflare Pages build read, the `engines` field of `package.json` declares it, and `engineStrict` makes `pnpm install` fail on an older Node.js; no dependency changed (#89).

The Before column is `4475253`, the base of the pull request, measured on 2026-10-28 with Node.js 24.22.0, in alternation with the After column, measured with Node.js 26.13.0, on the same machine, with the measuring tool and the method of the [introduction](#evolution).

| Figure                    | Before                                   | After                       |
| ------------------------- | ---------------------------------------- | --------------------------- |
| Stack                     | Node.js 24.22.0                          | Node.js 26.13.0             |
| Install time              | 0.5 s (0.5, 0.6, 0.5)                    | 0.6 s (0.6, 0.6, 0.6)       |
| Build time                | 0.2 s (0.8, 0.2, 0.2)                    | 0.2 s (0.7, 0.2, 0.2)       |
| JavaScript, raw / gzipped | 255,645 B / 81,502 B                     | the same                    |
| CSS, raw / gzipped        | 3,140 B / 1,200 B                        | the same                    |
| Audit (`pnpm audit`)      | 0 advisories                             | 0 advisories                |
| Tests                     | 661: 244 Node.js test runner, 417 Vitest | the same 661                |
| Test suite time           | 9.1 s (9.5, 9.1, 9.0)                    | 8.5 s (8.8, 8.5, 8.4)       |
| CI duration               | see the pull request of #89              | see the pull request of #89 |

Decision: [0014. Move to Node.js 26, the Active LTS](decisions/0014-move-to-node-26.md)

## Current state

Measured on 2026-10-28 on the pull request of #55, on an Apple M3 with 8 cores, macOS (Darwin 27.0.0), Node.js 24.22.0 and pnpm 12.14.0, except the Lighthouse scores, measured on 2026-10-24 on the production site, which served the build of `9e44f52`, the merge of pull request #59 (`index-CrBqt4YC.js` and `index-BzBp1EiE.css`).

| Figure                  | Value                                                                                                                | How it was measured                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Stack                   | React 19.3, Redux Toolkit 2.13, React Redux 9.3, TypeScript 6.0, Vite 8.3, Vitest 5.0, Playwright 1.64, Prettier 3.9 | the versions of `package.json`                                                                                                         |
| JavaScript              | 255,867 B raw, 81,629 B gzipped                                                                                      | `wc -c` and `gzip -c <file> \| wc -c` on `build/assets/index-*.js`, the only script, after `pnpm build`                                |
| CSS                     | 3,140 B raw, 1,200 B gzipped                                                                                         | the same on `build/assets/index-*.css`, the only stylesheet                                                                            |
| Test suite              | 636 tests: 221 Node.js test runner, 415 Vitest (18 files)                                                            | `pnpm test`                                                                                                                            |
| Smoke tests             | 17 Playwright tests in Chromium (4 files)                                                                            | `pnpm exec playwright test --list`, and `pnpm test:e2e`, which passed them all                                                         |
| Direct dependencies     | 4 dependencies, 25 development dependencies                                                                          | the keys of `package.json`                                                                                                             |
| `pnpm audit` advisories | none                                                                                                                 | `pnpm audit --json`, `metadata.vulnerabilities`                                                                                        |
| Lighthouse (mobile)     | performance 100, accessibility 100, best practices 100, SEO 100                                                      | `npx lighthouse@12.8.2 https://calculator.issoufi.fr` in headless Chrome, default mobile settings; the three runs gave the same scores |

- Vite prints 82.47 kB for the gzipped script: it compresses at a different level than `gzip -c`, the command of every table of this page.
- Lighthouse ran on the production site, as for the baseline of the npm eras, where the baseline of the TypeScript era ran on the local `build/`: compare these scores with those of the [baseline of the npm eras](#baseline-of-the-npm-eras).
- The script grew by 71,119 B raw since the baseline of the TypeScript era, mostly from React DOM 19 (see [its era](#2026-react-19-redux-toolkit-2-and-react-redux-9)).

## Baseline of the TypeScript era (#5)

Measured on 2026-10-20 on the pull request of #5, on an Apple M3 with 8 cores, macOS (Darwin 25.6.0), Node.js 24.22.0 and pnpm 12.14.0, with a load average of 13 to 17 from other builds. Each timed command ran six times, in two rounds that alternate with the previous era, with `/usr/bin/time -p` except the dev server (see its row); the table keeps the median.

| Figure                  | Value                                                                          | How it was measured                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install time            | 1.63 s (runs: 1.75, 1.90, 1.51, 1.81, 1.03, 1.11 s)                            | `pnpm install --frozen-lockfile` after deleting `node_modules`, with a warm pnpm store                                                                                 |
| Build time              | 0.40 s (runs: 1.75, 0.35, 0.45, 1.22, 0.19, 0.24 s)                            | `pnpm build` after deleting `build/` and `node_modules/.vite`                                                                                                          |
| Dev server start        | 0.52 s (runs: 0.52, 0.62, 0.39, 0.29, 0.52, 0.55 s)                            | a Node.js script that polls the server every 50 ms, from the launch of `vite` until it serves the page and `src/index.tsx`; `node_modules/.vite` kept between the runs |
| Type check time         | 1.19 s (runs: 1.41, 1.13, 1.07, 1.29, 1.25, 1.04 s)                            | `pnpm typecheck`                                                                                                                                                       |
| Lint time               | 1.97 s (runs: 1.80, 1.60, 1.71, 3.40, 2.14, 2.51 s)                            | `pnpm lint`                                                                                                                                                            |
| JavaScript              | 184,748 B raw, 60,919 B gzipped                                                | `wc -c` and `gzip -c <file> \| wc -c` on `build/assets/index-*.js`, the only script                                                                                    |
| CSS                     | 2,733 B raw, 1,080 B gzipped                                                   | the same on `build/assets/index-*.css`, the only stylesheet                                                                                                            |
| Test suite              | 454 tests: 187 Node.js test runner, 267 Vitest (11 files)                      | `pnpm test`                                                                                                                                                            |
| Test suite time         | 7.23 s (runs: 9.79, 7.89, 7.07, 6.18, 7.10, 7.36 s)                            | the same command, nothing deleted between the runs (warm caches)                                                                                                       |
| Direct dependencies     | 5 dependencies, 22 development dependencies                                    | the keys of `package.json`                                                                                                                                             |
| `pnpm audit` advisories | none                                                                           | `pnpm audit --json`, `metadata.vulnerabilities`                                                                                                                        |
| CI duration             | 33 s, of which 29 s for the job that lints, checks the types, tests and builds | `gh run view`: run 39406687648 of the pull request of #5, from `createdAt` to `updatedAt`, and the times of its jobs                                                   |
| Lighthouse (mobile)     | performance 97, accessibility 90, best practices 100, SEO 90                   | `npx lighthouse@12.8.2` on `build/` served by `python3 -m http.server`, default mobile settings; the three runs gave the same scores                                   |

## Baseline of the npm eras

Measured on `master` at `8c6bd3d` on 2026-10-20, on an Apple M3 with 8 cores, macOS (Darwin 25.6.0), Node.js 24.22.0 and npm 12.2.0. Each timed command ran three times with `/usr/bin/time -p`; the table keeps the median.

| Figure                          | Value                                                         | How it was measured                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Install time                    | 5.73 s (runs: 5.94, 5.73, 5.54 s)                             | `npm ci` after deleting `node_modules`, with a warm npm cache                                                                          |
| Build time                      | 3.62 s (runs: 3.31, 3.62, 4.71 s)                             | `npm run build` after deleting `build/` and `node_modules/.cache`, so with a cold build cache                                          |
| JavaScript                      | 188,515 B raw, 61,179 B gzipped                               | `wc -c` and `gzip -c <file> \| wc -c` on `build/static/js/main.*.js`, the only script                                                  |
| CSS                             | 3,050 B raw, 1,186 B gzipped                                  | the same on `build/static/css/main.*.css`, the only stylesheet                                                                         |
| Test suite                      | 445 tests: 187 Node.js test runner, 258 Jest (8 suites)       | `CI=true npm test -- --watchAll=false`                                                                                                 |
| Test suite time                 | 3.21 s (runs: 3.92, 3.21, 2.88 s)                             | the same command, with the Jest cache warm                                                                                             |
| Direct dependencies             | 9 dependencies, 5 development dependencies                    | the keys of `package.json`                                                                                                             |
| `npm audit` vulnerable packages | 14 low, 47 moderate, 33 high, 5 critical (99)                 | `npm audit --json`, `metadata.vulnerabilities`                                                                                         |
| CI duration                     | 45 s                                                          | `gh run list`: run 39388860605 of the push of `8c6bd3d` to `master`, from `createdAt` to `updatedAt`                                   |
| Lighthouse (mobile)             | performance 100, accessibility 90, best practices 100, SEO 82 | `npx lighthouse@12.8.2 https://calculator.issoufi.fr` in headless Chrome, default mobile settings; the three runs gave the same scores |

The old eras were measured with the same commands, in a detached worktree of their last commit. Both still install and build with Node.js 24; npm skipped the install scripts of `uglifyjs-webpack-plugin` and `fsevents` in the 2018 tree, and its build still succeeded. Their sites are not deployed any more, so their Lighthouse scores are not measured.
