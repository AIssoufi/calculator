# 0007. Lint commit messages with commitlint and husky

- Date: 2026-10-20
- Status: Accepted

## Context

Commits were meant to follow Conventional Commits and to name their ticket, so that the reason for a change can be found from `git log` or `git blame`. Nothing enforced it, and the history shows it: the 2018 commits have no conventional header ("fix bug"), and `59102ea` uses the type `refacto`, which Conventional Commits tools do not know.

## Decision

Pull request #19 added commitlint with `@commitlint/config-conventional` and a rule that requires a `Refs: CALC-<n>` trailer, and husky, installed by the `prepare` script:

- the `commit-msg` hook runs commitlint and refuses a bad message;
- on a `CALC-<n>` branch, the `prepare-commit-msg` hook adds the `Refs:` trailer when it is missing;
- a CI job checks every commit of a pull request and its title.

Merge commits, reverts and the commits of release-please and Dependabot are exempt, and older commits are not rewritten.

## Alternatives considered

- A review checklist: it relies on each author to remember the format.
- A CI check alone: a bad message is found only after the push, and rewriting a pushed commit costs a force push.

## Consequences

- A commit without a conventional header or a ticket reference is refused locally and in the CI.
- The rules have their own tests under `scripts/commits/`, run with the Node.js test runner by `npm test`: 187 of the 445 tests on 2026-10-20.
- The project gained five development dependencies: four commitlint packages and husky.
