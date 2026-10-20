# Journal

Every action can be traced back to the agent that did it, from two places.

## On GitHub

The ticket reference ties everything together:

- the branch is named `CALC-<n>`;
- every commit carries a `Refs: CALC-<n>` trailer, checked by commitlint since [#19](https://github.com/AIssoufi/calculator/pull/19);
- the pull request says `Closes #<n>`, and its body records the test plan and the review verdicts;
- the merge commit names the pull request and its branch, such as `Merge pull request #23 from AIssoufi/CALC-4`.

To read the history of a ticket:

```bash
git log --grep='Refs: CALC-4'   # the commits of a ticket
gh pr list --state merged       # the merged pull requests and their branches
```

[`docs/evolution.md`](../evolution.md) and [`docs/decisions/`](../decisions/), written in [#20](https://github.com/AIssoufi/calculator/pull/20), tell why the stack changed.

## Outside the repository

The agents also keep an append-only journal on the owner's machine, one JSON line per event, outside this repository:

- a registry of sessions: each agent's name (`MASTER-CALC`, `CALC-8`), role, parent agent and transcript;
- a log of actions: workers started, issues created, findings rejected, pull requests opened and merged, decisions of the owner, each with a short reason.

It answers "which agent merged [#18](https://github.com/AIssoufi/calculator/pull/18), and why?" with a link to the transcript of its reasoning. Its format is described on the [Traceability](https://github.com/AIssoufi/AIssoufi/blob/main/docs/agentic-architecture/traceability.md) page of the profile repository.
