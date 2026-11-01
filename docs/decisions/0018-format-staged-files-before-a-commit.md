# 0018. Format the staged files before a commit

- Date: 2026-10-28
- Status: Accepted

## Context

[0013](0013-add-prettier.md) left formatting to the CI: nothing formatted a file before a commit, so a forgotten `pnpm format` failed the CI after the push (#74). A commit can hold part of a file, or be made with `git commit -- <paths>`, which uses a temporary index, so running Prettier on the files on disk would commit changes that were not staged.

## Decision

`.husky/pre-commit` runs `node scripts/commits/pre-commit.mjs`, which calls the API of Prettier directly:

- it reads the staged files from `git diff --cached --raw -z`;
- it formats the staged version and the version on disk apart, so a partly staged file keeps its unstaged lines out of the commit;
- it supports the temporary index and the `index.lock` of `git commit -- <paths>`;
- it skips deleted files, symlinks, ignored files and types Prettier does not know;
- it refuses the commit when the staged code does not parse.

This replaces the consequence of 0013 that nothing formats a file before a commit. `pnpm format:check` stays in the CI, since a hook can be skipped.

## Alternatives considered

- lint-staged: it does this work, for one more dependency. The script took 563 added lines with its tests, in the repository.
- Formatting on disk, then `git add`: it would stage the lines that the author left out.

## Consequences

- The hook took 0.10 s on one staged file, so a commit does not feel slower.
- The specs of the script run real Git repositories, isolated with `GIT_CONFIG_GLOBAL=/dev/null` and `GIT_CONFIG_NOSYSTEM=1`.
- The script follows the plumbing of Git, so the project owns its edge cases.
