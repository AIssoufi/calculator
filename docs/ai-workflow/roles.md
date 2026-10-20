# Roles

| Role | Runs as | Does | Never does |
| --- | --- | --- | --- |
| Owner | A human | Sets priorities, answers the questions of the agents, approves anything public or hard to undo (a domain, a deployment setting) | |
| Master | A Claude Code session on `master`, in the main checkout | Creates and prioritizes issues, starts and briefs the workers, relays the owner's decisions, merges | Write the code of a ticket |
| Worker | A Claude Code session in the worktree of one ticket | Implements the ticket, runs the checks, asks for the reviews, opens the pull request | Merge, touch another branch, fix something outside its ticket |
| Auditor | A read-only sub-agent of the master | Looks for bugs, outdated packages, accessibility, performance and documentation gaps, and returns ranked findings | Change any file |
| Conventions reviewer | A read-only sub-agent of the worker | Checks the change against the coding conventions and the README | Change any file |
| Visual tester | A sub-agent of the worker | Screenshots the app at phone, tablet, laptop and desktop widths, and checks that the change works and nothing else broke | Change the code |

## Findings outside a ticket

A worker that notices a problem outside its ticket does not fix it: it reports a finding to the master, which searches the open issues and either creates a ticket or links an existing one. While migrating to Vite in [#23](https://github.com/AIssoufi/calculator/pull/23), a worker found that ESLint 10 was blocked by `eslint-plugin-react`; the master opened [#22](https://github.com/AIssoufi/calculator/issues/22) for it. In [#21](https://github.com/AIssoufi/calculator/pull/21), the worker left the `FunctionPad` part of [#10](https://github.com/AIssoufi/calculator/issues/10) alone and said why: [#7](https://github.com/AIssoufi/calculator/issues/7) had already fixed it.

## Questions

When a ticket is unclear, the worker asks the master, and the master asks the owner when it cannot answer from the issue, the code or a previous decision. The answer comes back to the worker and, when it changes the plan, to the issue.
