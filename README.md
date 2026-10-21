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
- `C` clears the number being typed, then the key turns into `AC`, which resets everything.
- Results are rounded to 12 significant digits, and a division by zero shows `Erreur`.

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
pnpm test        # a single run of every test, as in the CI
pnpm test:watch  # watch mode: re-runs the tests of the changed files
```

[ESLint](https://eslint.org/) applies its recommended rules, and the [typescript-eslint](https://typescript-eslint.io/), React and Rules of Hooks rules to `src/`; its settings are in [`eslint.config.js`](eslint.config.js).

The app is written in [TypeScript](https://www.typescriptlang.org/), in strict mode. Vite and Vitest strip the types without checking them, so `pnpm typecheck` runs `tsc` on `src/`, with the settings of [`tsconfig.json`](tsconfig.json), and fails on any type error. The configuration files and the commit tooling stay in JavaScript.

Tests sit next to the code they cover and are named `*.spec.ts`, `*.spec.tsx` or, for the commit tooling, `*.spec.mjs`:

- [Vitest](https://vitest.dev/) runs the app tests in [jsdom](https://github.com/jsdom/jsdom), with [Testing Library](https://testing-library.com/) and the [jest-dom](https://github.com/testing-library/jest-dom) matchers; its settings are in [`vite.config.js`](vite.config.js).
- `pnpm test` first runs the tests of the commit tooling once, `scripts/**/*.spec.mjs`, with the Node.js test runner.

The [CI workflow](.github/workflows/ci.yml) runs on every pull request and every push to `master`:

1. it installs the dependencies with `pnpm install --frozen-lockfile`, which fails when `pnpm-lock.yaml` does not match `package.json`;
2. it lints the code;
3. it checks the types;
4. it runs the tests once;
5. it builds the app.

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

Two files make the build fit Cloudflare Pages:

- [`vite.config.js`](vite.config.js) sets `base` to `./`: the built `index.html` loads its assets with relative paths, so the app works from the root of any domain, previews included.
- [`public/_headers`](public/_headers) is copied into `build/` and sets the cache headers:
  - the hashed files under `/assets/` are cached for a year;
  - the page is revalidated on every visit, so a new deployment shows at once.

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