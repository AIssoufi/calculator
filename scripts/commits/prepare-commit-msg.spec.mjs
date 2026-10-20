import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const HOOK_SCRIPT = fileURLToPath(new URL('./prepare-commit-msg.mjs', import.meta.url));

/** Identity and hooks of the throwaway repositories, whatever the git configuration of the machine. */
const GIT_OPTIONS = ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'core.hooksPath=/dev/null'];

const repositories = [];

after(() => {
  repositories.forEach(repository => rmSync(repository, { recursive: true, force: true }));
});

const git = ({ cwd, args }) => execFileSync('git', [...GIT_OPTIONS, ...args], { cwd, encoding: 'utf8' });

/** Creates an empty repository whose current branch is the given one. */
const createRepository = branch => {
  const repository = mkdtempSync(join(tmpdir(), 'prepare-commit-msg-'));

  repositories.push(repository);
  git({ cwd: repository, args: ['init', '--quiet', '--initial-branch', branch] });

  return repository;
};

/**
 * Runs the hook in a repository on a message file, as git does, and gives back the file content.
 *
 * @param {{ repository: string, message: string, args?: string[] }} params - Repository, initial
 * content of the message file, and arguments that git passes after the file name.
 */
const runHook = ({ repository, message, args = [] }) => {
  const messageFile = join(repository, 'COMMIT_EDITMSG');

  writeFileSync(messageFile, message);
  execFileSync(process.execPath, [HOOK_SCRIPT, messageFile, ...args], { cwd: repository });

  return readFileSync(messageFile, 'utf8');
};

describe('prepare-commit-msg.mjs', () => {
  it('adds the ticket of the branch to a message without a Refs: trailer', () => {
    const repository = createRepository('CALC-5');

    assert.equal(runHook({ repository, message: 'feat: add a key\n', args: ['message'] }), 'feat: add a key\n\nRefs: CALC-5\n');
  });

  it('adds the trailer next to Co-Authored-By', () => {
    const repository = createRepository('CALC-5');
    const message = 'feat: add a key\n\nCo-Authored-By: A <a@example.com>\n';

    assert.equal(runHook({ repository, message }), 'feat: add a key\n\nRefs: CALC-5\nCo-Authored-By: A <a@example.com>\n');
  });

  it('prepares the editor template so that the typed header gives a valid message', () => {
    const repository = createRepository('CALC-5');
    const prepared = runHook({ repository, message: '\n# Please enter the commit message for your changes.\n' });
    const typed = prepared.replace(/^/, 'feat: add a key');
    const cleanedUp = execFileSync('git', ['stripspace', '--strip-comments'], { input: typed, encoding: 'utf8' });

    assert.equal(cleanedUp, 'feat: add a key\n\nRefs: CALC-5\n');
  });

  it('adds nothing when the message already has a Refs: trailer', () => {
    const repository = createRepository('CALC-5');
    const message = 'feat: add a key\n\nRefs: CALC-4\n\nCo-Authored-By: A <a@example.com>\n';

    assert.equal(runHook({ repository, message }), message);
  });

  it('leaves the message of a merge commit as it is', () => {
    const repository = createRepository('CALC-5');
    const message = "Merge branch 'master' into CALC-5\n";

    assert.equal(runHook({ repository, message, args: ['merge'] }), message);
  });

  it('leaves the message as it is on a branch that is not a ticket', () => {
    const repository = createRepository('master');

    assert.equal(runHook({ repository, message: 'feat: add a key\n' }), 'feat: add a key\n');
  });

  it('leaves the message as it is on a detached HEAD', () => {
    const repository = createRepository('CALC-5');

    git({ cwd: repository, args: ['commit', '--quiet', '--allow-empty', '--message', 'chore: start'] });
    git({ cwd: repository, args: ['checkout', '--quiet', '--detach'] });

    assert.equal(runHook({ repository, message: 'feat: add a key\n' }), 'feat: add a key\n');
  });

  it('does nothing without a message file', () => {
    const repository = createRepository('CALC-5');

    assert.doesNotThrow(() => execFileSync(process.execPath, [HOOK_SCRIPT], { cwd: repository }));
  });
});
