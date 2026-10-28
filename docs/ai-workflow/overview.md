# How AI agents work on this repository

Most issues, pull requests and review verdicts of this repository are written by [Claude Code](https://claude.com/claude-code) agents. A human owner sets the direction and keeps the last word; the agents do the day-to-day work.

- **One master agent** keeps the board: it turns findings and requests into issues, gives each ticket to a worker, relays questions to the owner and merges the pull requests.
- **One worker agent per ticket** works alone in its own Git worktree, on a branch named after the ticket (`CALC-8`), and opens one pull request.
- **Sub-agents** do focused, read-only jobs for them: audit the repository, review a change against the conventions, test it in a browser.

Several workers run at the same time, so the master merges their pull requests one at a time, and each worker rebases its branch on `master` before it reports.

A typical round: an audit found that the author links covered the bottom keys on phones and opened [#8](https://github.com/AIssoufi/calculator/issues/8); a worker fixed it in [#18](https://github.com/AIssoufi/calculator/pull/18), with before and after screenshots and the verdicts of the reviewers; the master merged it once the CI passed.

## Read more

| Page                                    | What it covers                                        |
| --------------------------------------- | ----------------------------------------------------- |
| [Roles](roles.md)                       | Who does what, and what the owner decides             |
| [Ticket lifecycle](ticket-lifecycle.md) | From a finding to a merged pull request               |
| [Reviews](reviews.md)                   | What is checked before a merge                        |
| [Journal](journal.md)                   | Where actions are logged, and how to read the history |
| [Tooling](tooling.md)                   | The tools that let the agents work in parallel        |

The setup shared by all the owner's repositories is described in the [agentic architecture docs](https://github.com/AIssoufi/AIssoufi/tree/main/docs/agentic-architecture) of the profile repository.
