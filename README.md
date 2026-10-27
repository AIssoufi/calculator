# Calculatrice
<p align="center">
  <img src="public/images/capture.png" alt="capture d'écran">
</p>

## [Démo](https://calculator.issoufi.fr)

## Lancer le projet

The project uses Node.js 24, pinned in `.nvmrc` (`nvm use` selects it), and [pnpm](https://pnpm.io/installation) 12.14.0, pinned by the `packageManager` field of `package.json`: an installed pnpm switches to that version by itself.

```bash
pnpm install  # install the dependencies from pnpm-lock.yaml, and the git hooks
pnpm start    # dev server on http://localhost:5173/
pnpm build    # production build in build/
pnpm preview  # serves the production build on http://localhost:4173/
```

[Vite](https://vite.dev/) serves and builds the app from [`index.html`](index.html), with the settings of [`vite.config.js`](vite.config.js). The files of `public/` are copied as they are to `build/`.

[`pnpm-workspace.yaml`](pnpm-workspace.yaml) holds the pnpm settings: pnpm only installs versions published at least 7 days ago, and runs no install script of a dependency unless it is listed in `allowBuilds` (none needs one).

## How it computes

The calculator works like a basic pocket calculator: it evaluates from left to right, so `2 + 3 × 4 =` gives `20`.

- An operator applies the previous one and shows the running total; two operators in a row keep the last one.
- `=` shows the result: an operator continues from it, a digit starts a new calculation.
- `=` pressed again repeats the last operator and operand on the result: `2 + 3 = =` gives `8`, then `11`.
- `%` after a pending `+` or `-` takes that share of the running total: `200 + 10 % =` gives `220`, and `100 - 20 % =` gives `80`. Otherwise it divides the number by 100: `50 × 10 % =` gives `5`, and `5 %` gives `0.05`.
- `C` clears the number being typed, then the key turns into `AC`, which resets everything.
- Results are rounded to 12 significant digits, and a division by zero shows `Erreur`. An integer is shown in full while it is exact (up to `2^53 - 1`); past that, or when rounding would change the digits of its integer part, a result is shown in exponent notation, such as `1.52415787502e+16`, so a rounded value never looks exact.

The logic lives in a pure, framework-free engine, [`src/features/calculator/engine.ts`](src/features/calculator/engine.ts): each key press is a function from one state to the next. The Redux slice next to it only hands the key presses to the engine.

## Keyboard and screen readers

Every key is a button: Tab reaches it and outlines it, and Enter or Space presses it. The keyboard also works from anywhere on the page:

| Keyboard | Key |
| --- | --- |
| `0` to `9` | the digit |
| `.` or `,` | `.` |
| `+`, `-`, `*`, `/` | the operator |
| `=` or Enter | `=`, unless a button or link has the focus: Enter then presses it |
| Escape or Backspace | `C`, then `AC` |
| `%` | `%` |

A key held down on the keyboard shows pressed. A key combined with Ctrl, Cmd or Alt is left to the browser, such as Ctrl and `-` to zoom out. Screen readers announce each change of the screen, and read the symbol keys by their names, such as "Multiplier".

## Tests

```bash
pnpm lint        # ESLint, as in the CI
pnpm typecheck   # TypeScript, as in the CI
pnpm test        # a single run of the unit tests, as in the CI
pnpm test:watch  # watch mode: re-runs the tests of the changed files
pnpm test:e2e    # the smoke tests of the production build in Chromium, as in the CI
```

[ESLint](https://eslint.org/) applies its recommended rules, the [typescript-eslint](https://typescript-eslint.io/) rules to `src/` and `e2e/`, and the React and Rules of Hooks rules to `src/`; its settings are in [`eslint.config.js`](eslint.config.js).

The app is written in [TypeScript](https://www.typescriptlang.org/), in strict mode. Vite and Vitest strip the types without checking them, so `pnpm typecheck` runs `tsc` on `src/`, with the settings of [`tsconfig.json`](tsconfig.json), then on `e2e/`, with those of [`e2e/tsconfig.json`](e2e/tsconfig.json), and fails on any type error. The configuration files and the commit tooling stay in JavaScript.

Unit tests sit next to the code they cover and are named `*.spec.ts`, `*.spec.tsx` or, for the scripts of [`scripts/`](scripts/), `*.spec.mjs`:

- [Vitest](https://vitest.dev/) runs the app tests in [jsdom](https://github.com/jsdom/jsdom), with [Testing Library](https://testing-library.com/) and the [jest-dom](https://github.com/testing-library/jest-dom) matchers; its settings are in [`vite.config.js`](vite.config.js).
- `pnpm test` first runs the tests of the scripts once, `scripts/**/*.spec.mjs`, those of the commit tooling and of the live check (see [Deployment](#deployment)), with the Node.js test runner.

jsdom does no layout, so the smoke tests of [`e2e/`](e2e/) check the production build in a real browser: [Playwright](https://playwright.dev/) runs them in Chromium, with the settings of [`playwright.config.js`](playwright.config.js). `pnpm test:e2e` builds the app, serves the build with `pnpm preview` on port 4173, and checks that it computes with the keyboard and the mouse, and that every key fits the screen of a phone and of a laptop.

Playwright installs no browser by itself: run `pnpm exec playwright install chromium` once. A port already taken fails the run, rather than testing another app: `E2E_PORT=4174 pnpm test:e2e` serves the build on another port.

The [CI workflow](.github/workflows/ci.yml) runs on every pull request and every push to `master`:

1. it installs the dependencies with `pnpm install --frozen-lockfile`, which fails when `pnpm-lock.yaml` does not match `package.json`;
2. it lints the code;
3. it checks the types;
4. it runs the tests once;
5. it builds the app;
6. it runs the smoke tests in Chromium, which it caches between runs until Playwright changes.

A lint error, a type error, a failing test or a failed build fails the check. On a pull request, a second job checks the commit messages and the title (see [Commit messages](#commit-messages)).

## Commit messages

Every commit follows [Conventional Commits](https://www.conventionalcommits.org/) and names its ticket with a `Refs: CALC-<n>` git trailer, in the last paragraph of the message, next to `Co-Authored-By`:

```text
feat: add a percent key

Refs: CALC-17
Co-Authored-By: Jane Doe <jane@example.com>
```

- `pnpm install` installs two [husky](https://typicode.github.io/husky/) hooks. `commit-msg` runs [commitlint](https://commitlint.js.org/), which refuses a message without a conventional header or a valid `Refs:` trailer. On a `CALC-<n>` branch, `prepare-commit-msg` adds `Refs: CALC-<n>` when the message has no `Refs:` trailer.
- On every pull request, the CI checks each commit, and checks that the title is a conventional header.
- Write a breaking change as a `BREAKING-CHANGE:` trailer, with a dash, or in a paragraph of its own above the trailers: git does not read `BREAKING CHANGE:` as a trailer, since its key has a space, so a `Refs:` line in the same paragraph is usually not found.
- Merge commits, reverts and the commits of release-please and Dependabot are ignored. The rule applies from now on: older commits are not rewritten.

The rules live in [`commitlint.config.mjs`](commitlint.config.mjs) and [`scripts/commits/`](scripts/commits/).

## Dependency updates

[Dependabot](https://docs.github.com/code-security/dependabot) proposes updates every week, with the settings of [`.github/dependabot.yml`](.github/dependabot.yml):

- one pull request for all the minor and patch updates of npm packages;
- one pull request for each major npm update;
- one pull request for all the GitHub Actions updates; the CI pins each action by full commit SHA, with its version in a comment on the same line (Dependabot updates both);
- no release younger than 7 days, like pnpm.

Its titles are conventional (`chore(deps):`, `chore(deps-dev):`, `ci(deps):`), although the CI skips the title check for bots and ignores the commits that Dependabot signs off.

## Deployment

[Cloudflare Pages](https://pages.cloudflare.com/) builds and hosts the app at https://calculator.issoufi.fr:

- every push to `master` deploys the production site;
- every other branch, pull requests included, gets a preview deployment with its own URL.

The Cloudflare Pages project uses these build settings:

| Setting                | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| Build command          | `pnpm build`                                            |
| Build output directory | `build`                                                 |
| Node.js version        | read from `.nvmrc` by the build image                   |
| Environment variables  | `PNPM_VERSION=12.14.0`, the version of `packageManager` |

The build image installs the dependencies with pnpm, since it finds `pnpm-lock.yaml`, but it reads the pnpm version from `PNPM_VERSION` only: update the variable whenever `packageManager` changes.

Three files make the build fit Cloudflare Pages:

- [`vite.config.js`](vite.config.js) sets `base` to `./`: the built `index.html` loads its assets with relative paths, so the app works from the root of any domain, previews included.
- [`public/_headers`](public/_headers) is copied into `build/` and sets the cache and security headers:
  - the hashed files under `/assets/` are cached for a year;
  - the page is revalidated on every visit, so a new deployment shows at once;
  - every response gets the security headers, as [`e2e/headers.spec.ts`](e2e/headers.spec.ts) checks:
    - a Content-Security-Policy that loads only the files of the site, forbids any frame around the page and, with Trusted Types, keeps the scripts from writing strings into the page as HTML or code;
    - HSTS, which keeps the browsers on HTTPS for a year;
    - a Permissions-Policy that turns off the camera, the microphone and the geolocation.
- [`public/404.html`](public/404.html) is the page of every path that matches no file of the build, such as a chunk removed by a later deployment:
  - Pages serves it with a 404 status; without it, Pages would answer such paths with `index.html` and a 200;
  - it loads only absolute paths, since it answers at any depth, as [`e2e/not-found.spec.ts`](e2e/not-found.spec.ts) checks.

The [Live check workflow](.github/workflows/live-check.yml) checks the production site every hour, at minute 17, and on demand from the Actions tab. It runs [`scripts/live-check/check-live-site.sh`](scripts/live-check/check-live-site.sh), which requests the site with curl and fails, with one line naming each failed check, unless:

- the page answers 200, holds `<title>Calculatrice</title>` and sends a Content-Security-Policy header;
- the hashed `assets/index-*.js` and `assets/index-*.css` files that the page references answer 200;
- `/manifest.json` answers 200 with a JSON object;
- `/does-not-exist` answers 404.

When a run fails, GitHub notifies the last person who changed the cron line. It also turns off a scheduled workflow after 60 days without activity in a public repository such as this one: turn the Live check back on from the Actions tab, or with `gh workflow enable live-check.yml`.

The script needs curl and jq only, and checks any deployment, a preview included; it adds `https://` to a bare host. `pnpm test` runs its tests, [`check-live-site.spec.mjs`](scripts/live-check/check-live-site.spec.mjs), against a fake site.

```bash
scripts/live-check/check-live-site.sh https://calculator.issoufi.fr
scripts/live-check/check-live-site.sh <preview>.calculator-1x0.pages.dev
```

## History

[`docs/evolution.md`](docs/evolution.md) tells how the stack changed era by era, with its figures, and [`docs/decisions/`](docs/decisions/) holds one record per tool decision.

## How AI agents work here

Most issues and pull requests of this repository are written by Claude Code agents: a master agent keeps the board and merges, and one worker agent per ticket works in its own worktree.

See [`docs/ai-workflow/`](docs/ai-workflow/overview.md) for their roles, the ticket lifecycle, the reviews, the journal and the tooling.

## Technos utilisées
* [ReactJS](http://redux.js.org)
* [ReduxJS](http://redux.js.org)
* [TypeScript](https://www.typescriptlang.org/)

## Autres captures d'écran
<p align="center">
<img src="public/images/redux.png" alt="redux">
<img src="public/images/react.png" alt="react">
</p>