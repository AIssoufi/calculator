# 0010. Install the dependencies with pnpm

- Date: 2026-10-20
- Status: Accepted

## Context

The project installed its dependencies with npm from `package-lock.json`. npm runs the install scripts of every dependency by default, and installs any version as soon as it is published, so a compromised release reaches the next install at once. Its flat `node_modules` also lets the code import a package it does not declare.

## Decision

The pull request of #4 moved the project to pnpm 12.14.0:

- `pnpm import` turned `package-lock.json` into `pnpm-lock.yaml` with the same locked versions, and `package-lock.json` was removed;
- the `packageManager` field of `package.json` pins pnpm, and an installed pnpm switches to that version by itself;
- [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) only lets in versions published at least 7 days ago (`minimumReleaseAge`), and pnpm runs no install script of a dependency unless it is listed in `allowBuilds`: none needs one;
- both CI jobs set pnpm up with `pnpm/action-setup`, which reads `packageManager`, install with `pnpm install --frozen-lockfile`, and run commitlint with `pnpm exec` instead of `npx`;
- the Cloudflare Pages project builds with `pnpm build` and sets `PNPM_VERSION=12.14.0`, since its build image reads the pnpm version from that variable only.

## Alternatives considered

- Staying on npm: it can also delay new versions (`min-release-age`), but it still runs every install script by default and keeps the flat `node_modules`.
- Yarn: its current versions need their own setup (Corepack, a `.yarnrc.yml`, Plug'n'Play or a `node_modules` linker) for no gain over pnpm here.
- Bun: it installs fast, but it brings a second runtime next to Node.js, which runs the app tooling and the CI.

## Consequences

- Measured on 2026-10-20 in alternation with `6b36056`, with warm caches, `pnpm install --frozen-lockfile` takes 0.94 s where `npm ci` took 5.89 s.
- A file that imports a package missing from `package.json` fails, since pnpm only links the declared dependencies at the top of `node_modules`.
- A new release waits 7 days before it can be installed. An urgent fix, such as a security release, goes in `minimumReleaseAgeExclude` for the time of its install.
- Contributors need pnpm installed, and the `PNPM_VERSION` variable of Cloudflare Pages must follow every change of `packageManager`.
