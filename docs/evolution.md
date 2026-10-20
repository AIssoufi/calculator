# Evolution

How the project's stack changed, era by era, oldest first. Each tool change has its Architecture Decision Record in [`decisions/`](decisions/).

The figures of every era were measured on 2026-10-20 from the last commit of that era, rebuilt in a detached worktree with the method of the [current baseline](#current-baseline). Each table compares the last commit of the previous era (Before) with the last commit of the era (After). `npm audit` reads today's advisory database, so it counts the packages vulnerable by what is known today, not by what was known at the time.

## 2018: a Create React App with Redux, on GitHub Pages

The calculator was generated with Create React App, split into components, then wired to a Redux store. A manual `npm run deploy` published the build to GitHub Pages with the `gh-pages` package. The project had no test and no CI.

Last commit: `ba770d8` (2018-04-27).

| Figure                                    | Before      | After                                               |
| ----------------------------------------- | ----------- | --------------------------------------------------- |
| Stack                                     | no project  | `react-scripts` 1.1.4, React 16.3, Redux 4          |
| Install time (`npm ci`)                   | no project  | 4.19 s                                              |
| Build time (`npm run build`)              | no project  | 2.32 s                                              |
| JavaScript, raw / gzipped                 | no project  | 162,560 B / 50,222 B                                |
| CSS, raw / gzipped                        | no project  | 2,689 B / 1,024 B                                   |
| Direct dependencies                       | no project  | 6                                                   |
| `npm audit` vulnerable packages (low / moderate / high / critical) | no project | 15 / 74 / 109 / 106 (304)                     |
| Tests                                     | no project  | 0                                                   |
| Lighthouse                                | no project  | not measured                                        |

Decisions:
- [0001. Bootstrap the app with Create React App](decisions/0001-bootstrap-with-create-react-app.md)
- [0002. Manage the calculator state with Redux](decisions/0002-manage-state-with-redux.md)
- [0003. Deploy the demo to GitHub Pages with gh-pages](decisions/0003-deploy-to-github-pages-with-gh-pages.md)

## 2023: English names, React 18 and Redux Toolkit

The dependencies from 2018 were five years old. The components and variables were renamed in English, React, React Redux and `react-scripts` were upgraded, and the Redux code moved to Redux Toolkit slices. `yarn.lock` was removed, leaving npm and `package-lock.json` alone.

Last commit: `59102ea` (2023-08-06).

| Figure                                    | Before                     | After                                                |
| ----------------------------------------- | -------------------------- | ---------------------------------------------------- |
| Stack                                     | `react-scripts` 1.1.4, React 16.3, Redux 4 | `react-scripts` 5.0.1, React 18.2, Redux Toolkit 1.9 |
| Install time (`npm ci`)                   | 4.19 s                     | 4.90 s                                               |
| Build time (`npm run build`)              | 2.32 s                     | 4.56 s                                               |
| JavaScript, raw / gzipped                 | 162,560 B / 50,222 B       | 187,013 B / 60,650 B                                 |
| CSS, raw / gzipped                        | 2,689 B / 1,024 B          | 2,417 B / 992 B                                      |
| Direct dependencies                       | 6                          | 10                                                   |
| `npm audit` vulnerable packages (low / moderate / high / critical) | 15 / 74 / 109 / 106 (304) | 14 / 48 / 34 / 6 (102)                         |
| Tests                                     | 0                          | 0                                                    |
| Lighthouse                                | not measured               | not measured                                         |

Decision: [0004. Move the Redux code to Redux Toolkit](decisions/0004-move-to-redux-toolkit.md)

## 2026: CI, Cloudflare Pages and a tested engine

The GitHub Pages demo was blank since the repository's rename, and nothing checked a change before its merge. A GitHub Actions workflow now installs, tests and builds every pull request (#13). The app is deployed by Cloudflare Pages at https://calculator.issoufi.fr, and the old URL redirects there (#14). The calculator logic moved into a pure, tested engine, `src/features/calculator/engine.js`, which fixed chained, zero and decimal input (#15), and the phone layout was fixed (#18). commitlint and husky now check every commit message (#19).

Last commit: `8c6bd3d` (2026-10-20), the current baseline.

| Figure                                    | Before                     | After                                                |
| ----------------------------------------- | -------------------------- | ---------------------------------------------------- |
| Stack                                     | `react-scripts` 5.0.1, React 18.2, Redux Toolkit 1.9 | unchanged, plus GitHub Actions, Cloudflare Pages, commitlint and husky |
| Install time (`npm ci`)                   | 4.90 s                     | 5.73 s                                               |
| Build time (`npm run build`)              | 4.56 s                     | 3.62 s                                               |
| JavaScript, raw / gzipped                 | 187,013 B / 60,650 B       | 188,515 B / 61,179 B                                 |
| CSS, raw / gzipped                        | 2,417 B / 992 B            | 3,050 B / 1,186 B                                    |
| Direct dependencies                       | 10                         | 14 (9 + 5 development)                               |
| `npm audit` vulnerable packages (low / moderate / high / critical) | 14 / 48 / 34 / 6 (102) | 14 / 47 / 33 / 5 (99)                              |
| Tests                                     | 0                          | 445                                                  |
| CI duration                               | no CI                      | 45 s                                                 |
| Lighthouse (mobile)                       | not measured               | 100 / 90 / 100 / 82                                  |

Decisions:
- [0005. Check every pull request with GitHub Actions](decisions/0005-run-ci-with-github-actions.md)
- [0006. Deploy to Cloudflare Pages at calculator.issoufi.fr](decisions/0006-deploy-to-cloudflare-pages.md), which supersedes 0003
- [0007. Lint commit messages with commitlint and husky](decisions/0007-lint-commit-messages-with-commitlint.md)

## Current baseline

Measured on `master` at `8c6bd3d` on 2026-10-20, on an Apple M3 with 8 cores, macOS (Darwin 25.6.0), Node.js 24.22.0 and npm 12.2.0. Each timed command ran three times with `/usr/bin/time -p`; the table keeps the median.

| Figure                       | Value                                                      | How it was measured                                                                                               |
| ---------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Install time                 | 5.73 s (runs: 5.94, 5.73, 5.54 s)                          | `npm ci` after deleting `node_modules`, with a warm npm cache                                                      |
| Build time                   | 3.62 s (runs: 3.31, 3.62, 4.71 s)                          | `npm run build` after deleting `build/` and `node_modules/.cache`, so with a cold build cache                      |
| JavaScript                   | 188,515 B raw, 61,179 B gzipped                            | `wc -c` and `gzip -c <file> \| wc -c` on `build/static/js/main.*.js`, the only script                              |
| CSS                          | 3,050 B raw, 1,186 B gzipped                               | the same on `build/static/css/main.*.css`, the only stylesheet                                                     |
| Test suite                   | 445 tests: 187 Node.js test runner, 258 Jest (8 suites)    | `CI=true npm test -- --watchAll=false`                                                                             |
| Test suite time              | 3.21 s (runs: 3.92, 3.21, 2.88 s)                          | the same command, with the Jest cache warm                                                                         |
| Direct dependencies          | 9 dependencies, 5 development dependencies                 | the keys of `package.json`                                                                                         |
| `npm audit` vulnerable packages | 14 low, 47 moderate, 33 high, 5 critical (99)              | `npm audit --json`, `metadata.vulnerabilities`                                                                     |
| CI duration                  | 45 s                                                       | `gh run list`: run 39388860605 of the push of `8c6bd3d` to `master`, from `createdAt` to `updatedAt`               |
| Lighthouse (mobile)          | performance 100, accessibility 90, best practices 100, SEO 82 | `npx lighthouse@12.8.2 https://calculator.issoufi.fr` in headless Chrome, default mobile settings; the three runs gave the same scores |

The old eras were measured with the same commands, in a detached worktree of their last commit. Both still install and build with Node.js 24; npm skipped the install scripts of `uglifyjs-webpack-plugin` and `fsevents` in the 2018 tree, and its build still succeeded. Their sites are not deployed any more, so their Lighthouse scores are not measured.
