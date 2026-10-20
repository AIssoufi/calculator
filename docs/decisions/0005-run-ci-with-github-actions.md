# 0005. Check every pull request with GitHub Actions

- Date: 2026-10-20
- Status: Accepted

## Context

Nothing checked that a change still installed, passed its tests and built before it reached `master`. The project had no test file, `npm test` ran Jest in watch mode, and no Node.js version was pinned.

## Decision

Pull request #13 added `.github/workflows/ci.yml`. On every pull request and every push to `master`, it runs `npm ci`, the tests once (`npm test -- --watchAll=false`) and `npm run build`, with the Node.js version read from `.nvmrc` (24). A new push to a pull request cancels its previous run, and the workflow token can only read the repository. The same pull request added the first test, a smoke test that renders the calculator, and a `setupStore` factory so a test can create its own store. Pull request #19 later added a second job that checks the commit messages ([0007](0007-lint-commit-messages-with-commitlint.md)).

## Alternatives considered

- A hosted CI service outside GitHub: it needs another account and a token to report its status, where GitHub Actions runs from a file of the repository.
- Running the checks only on a developer machine: nothing guarantees that they ran before a merge.

## Consequences

- A failing test or build fails the check of the pull request.
- On `master` on 2026-10-20, the CI ran in 45 s (run 39388860605, from `createdAt` to `updatedAt`), and the suite holds 445 tests (see [the baseline](../evolution.md#baseline-of-the-npm-eras)).
- The workflow uses npm; the move to pnpm (#4) will update it.
