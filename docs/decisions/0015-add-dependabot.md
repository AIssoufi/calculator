# 0015. Propose dependency updates with Dependabot

- Date: 2026-10-21
- Status: Accepted

## Context

Every update of a package or a GitHub Action was found and made by hand, in its own ticket, so the project only moved when someone looked (#33). pnpm already refuses a release younger than its `minimumReleaseAge` of 7 days, so an updater should not propose a release that pnpm would refuse.

## Decision

`.github/dependabot.yml` runs two weekly updates:

- `npm`: the minor and patch updates share one pull request (the group `npm-minor-and-patch`), and each major update gets its own;
- `github-actions`: every action in one group.

Both wait out a `cooldown` of 7 days, the same as `minimumReleaseAge`, and write titles that the commit convention accepts (`chore` and `ci`, with a scope), which a spec of the commitlint configuration checks.

## Alternatives considered

- Renovate: it needs an app or a runner of its own, where Dependabot ships with GitHub.
- Updates by hand: this was the state that #33 set out to end.

## Consequences

- Updates arrive as pull requests that pass the same checks as any other, and the owner decides on each one.
- The setting does not prove that the updates run. On 2026-10-21 the cooldown filtered every update. The weekly run of 2026-10-26 never started, for a cause not confirmed: the dependency graph may be off, since the SBOM endpoint answered 404 until at least 2026-11-01 (#79). On 2026-11-01 Dependabot had opened no pull request yet.
- Dependabot runs on the Node.js of its own image, so the `engineStrict` of [0014](0014-move-to-node-26.md) may stop its npm updates; #94 tracks this check.
