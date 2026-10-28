# 0014. Move to Node.js 26, the Active LTS

- Date: 2026-10-28
- Status: Accepted

## Context

The project ran on Node.js 24, pinned by its major version in `.nvmrc`, which the CI (`actions/setup-node`) and the Cloudflare Pages build image both read. `package.json` declared no Node.js version. The release schedule of Node.js, `schedule.json` of the `nodejs/Release` repository, put Node.js 24 in maintenance on 2026-10-20, with critical and security fixes only until its end of life on 2028-04-30, and made Node.js 26 the Active LTS on 2026-10-28, maintained until 2029-04-30.

## Decision

The pull request of #89 moved the project to Node.js 26:

- `.nvmrc` holds `26`, so the CI and the Cloudflare Pages build install a Node.js 26 release, as the logs of the pull request show;
- the `engines` field of `package.json` declares `"node": ">=26"`, and `engineStrict: true` in [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) makes `pnpm install` fail on an older Node.js, which it would otherwise accept without a warning;
- no dependency changed: the lockfile, the build, the tests and the CI workflow are the same.

## Alternatives considered

- Staying on Node.js 24 until its end of life: it gets no more features or performance work, only critical and security fixes, and the move would have to be made later anyway.
- Pinning the exact version, such as `26.13.0`, in `.nvmrc`: the CI and the Cloudflare Pages build would then miss each patch release, security ones included, until someone bumps the file, where the major version alone gives them at the next run.
- Declaring the `engines` field alone: pnpm 12.14.0 still installed the dependencies on Node.js 24.22.0, with exit code 0 and no warning, so a contributor on an old Node.js would only find out from a failure later, if ever.

## Consequences

- Measured on 2026-10-28 with the method of the [introduction of `docs/evolution.md`](../evolution.md#evolution), Node.js 24.22.0 against Node.js 26.13.0 on the same machine (medians of 3 runs): the clean install takes 0.5 s before and 0.6 s after, the build 0.2 s and 0.2 s, and the test suite 9.1 s and 8.5 s, for the same 661 tests. The built script weighs 255,645 B raw and 81,502 B gzipped before and after, the stylesheet 3,140 B and 1,200 B, and `pnpm audit` reports 0 advisories before and after.
- The lint, the format check, the type check, the unit tests, the build and the smoke tests pass on Node.js 26.
- `pnpm install` on Node.js 24 now fails with `ERR_PNPM_UNSUPPORTED_ENGINE`. A contributor still on Node.js 24 runs `nvm install 26` once, then `nvm use`, which selects the version of `.nvmrc`. The other scripts, such as `pnpm build`, still run on Node.js 24: only the install checks the version.
- The CI duration is in the pull request of #89.
