// Git `prepare-commit-msg` hook, run by husky: on a branch named after a ticket, such as
// `CALC-17`, it adds `Refs: CALC-17` to the message when its footer has no `Refs:` trailer.
// Usage: node scripts/commits/prepare-commit-msg.mjs <message file> [<source> [<commit>]]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { prepareCommitMessage } from './utils/tickets.mjs';

const [messageFile, source] = process.argv.slice(2);

/** Gives the current branch, or `''` on a detached HEAD, as during a rebase. */
const getCurrentBranch = () =>
  execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();

if (messageFile) {
  const message = readFileSync(messageFile, 'utf8');
  const preparedMessage = prepareCommitMessage({ message, branch: getCurrentBranch(), source });

  if (preparedMessage !== message) {
    writeFileSync(messageFile, preparedMessage);
  }
}
