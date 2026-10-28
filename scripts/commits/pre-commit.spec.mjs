import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const HOOK_SCRIPT = fileURLToPath(new URL('./pre-commit.mjs', import.meta.url));

/** Folder of the hooks of the throwaway repositories, from their root. */
const HOOKS_FOLDER = 'hooks';

/** Permissions of the hook file: git only runs an executable hook. */
const EXECUTABLE_MODE = 0o755;

/** Identity of the throwaway repositories, whatever the git configuration of the machine. */
const GIT_OPTIONS = ['-c', 'user.name=Test', '-c', 'user.email=test@example.com'];

/** Environment of git, without the global and system configuration of the machine. */
const GIT_ENV = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };

/** A JavaScript file that Prettier would format, and the same file formatted with its defaults. */
const UNFORMATTED_CODE = 'const   one=1\n';
const FORMATTED_CODE = 'const one = 1;\n';

/** A line added to the file above, as a change left out of the index. */
const UNFORMATTED_EXTRA_LINE = 'const   two=2\n';
const FORMATTED_EXTRA_LINE = 'const two = 2;\n';

/** JavaScript that Prettier cannot parse. */
const INVALID_CODE = 'const = ;\n';

const repositories = [];

after(() => {
  repositories.forEach(repository => rmSync(repository, { recursive: true, force: true }));
});

const git = ({ cwd, args }) =>
  execFileSync('git', [...GIT_OPTIONS, ...args], {
    cwd,
    encoding: 'utf8',
    env: GIT_ENV,
    stdio: ['ignore', 'pipe', 'pipe']
  });

/** Creates a repository with a first commit, whose pre-commit hook runs the script under test. */
const createRepository = () => {
  const repository = mkdtempSync(join(tmpdir(), 'pre-commit-'));
  const hookFile = join(repository, HOOKS_FOLDER, 'pre-commit');

  repositories.push(repository);
  mkdirSync(join(repository, HOOKS_FOLDER));
  writeFileSync(hookFile, `#!/bin/sh\nexec "${process.execPath}" "${HOOK_SCRIPT}"\n`);
  chmodSync(hookFile, EXECUTABLE_MODE);
  git({ cwd: repository, args: ['init', '--quiet'] });
  git({ cwd: repository, args: ['config', 'core.hooksPath', HOOKS_FOLDER] });
  git({ cwd: repository, args: ['commit', '--quiet', '--allow-empty', '--message', 'init'] });

  return repository;
};

/**
 * Writes files in a repository.
 *
 * @param {{ repository: string, files: Record<string, string> }} params - Repository, and the
 * content of each file by its path.
 */
const writeFiles = ({ repository, files }) => {
  Object.entries(files).forEach(([filePath, content]) =>
    writeFileSync(join(repository, filePath), content)
  );
};

/**
 * Commits what is staged, or the given paths only, and lets the hook run.
 *
 * @param {{ repository: string, paths?: string[] }} params - Repository, and the paths of a
 * commit of some paths only.
 */
const commit = ({ repository, paths = [] }) => {
  const pathArgs = paths.length > 0 ? ['--', ...paths] : [];

  git({ cwd: repository, args: ['commit', '--quiet', '--message', 'test', ...pathArgs] });
};

/**
 * Gives the content of a file in the last commit.
 *
 * @param {{ repository: string, filePath: string }} params - Repository and path of the file.
 */
const readCommitted = ({ repository, filePath }) =>
  git({ cwd: repository, args: ['show', `HEAD:${filePath}`] });

/**
 * Gives the content of a file on disk.
 *
 * @param {{ repository: string, filePath: string }} params - Repository and path of the file.
 */
const readOnDisk = ({ repository, filePath }) => readFileSync(join(repository, filePath), 'utf8');

/** Gives `git status --short` without the hooks folder, which is never committed. */
const getStatus = repository =>
  git({ cwd: repository, args: ['status', '--short', '--', '.', `:!${HOOKS_FOLDER}`] });

describe('pre-commit.mjs', () => {
  it('formats a staged file in the commit and on disk', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'one.js': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'one.js'] });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'one.js' }), FORMATTED_CODE);
    assert.equal(readOnDisk({ repository, filePath: 'one.js' }), FORMATTED_CODE);
    assert.equal(getStatus(repository), '');
  });

  it('keeps the unstaged changes of a file out of the commit', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'one.js': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'one.js'] });
    writeFiles({ repository, files: { 'one.js': UNFORMATTED_CODE + UNFORMATTED_EXTRA_LINE } });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'one.js' }), FORMATTED_CODE);
    assert.equal(
      readOnDisk({ repository, filePath: 'one.js' }),
      FORMATTED_CODE + FORMATTED_EXTRA_LINE
    );
    assert.equal(getStatus(repository), ' M one.js\n');
  });

  it('formats a commit of some paths only, and keeps the index in step with it', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'one.js': UNFORMATTED_CODE, 'two.js': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'one.js', 'two.js'] });
    commit({ repository, paths: ['one.js'] });

    assert.equal(readCommitted({ repository, filePath: 'one.js' }), FORMATTED_CODE);
    assert.equal(git({ cwd: repository, args: ['show', ':one.js'] }), FORMATTED_CODE);
    assert.equal(getStatus(repository), 'A  two.js\n');
  });

  it('leaves a file that .prettierignore lists as it is', () => {
    const repository = createRepository();

    writeFiles({
      repository,
      files: { '.prettierignore': 'ignored.js\n', 'ignored.js': UNFORMATTED_CODE }
    });
    git({ cwd: repository, args: ['add', '.prettierignore', 'ignored.js'] });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'ignored.js' }), UNFORMATTED_CODE);
  });

  it('leaves a file whose type Prettier does not know as it is', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'notes.unknown': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'notes.unknown'] });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'notes.unknown' }), UNFORMATTED_CODE);
  });

  it('commits a deleted file', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'one.js': FORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'one.js'] });
    commit({ repository });
    git({ cwd: repository, args: ['rm', '--quiet', 'one.js'] });
    commit({ repository });

    assert.equal(git({ cwd: repository, args: ['ls-tree', '--name-only', 'HEAD'] }), '');
  });

  it('formats a file whose name holds a space', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'one file.js': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'one file.js'] });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'one file.js' }), FORMATTED_CODE);
  });

  it('leaves a symbolic link as it is', () => {
    const repository = createRepository();

    symlinkSync('target.js', join(repository, 'link.js'));
    git({ cwd: repository, args: ['add', 'link.js'] });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'link.js' }), 'target.js');
  });

  it('formats a symbolic link turned into a file', () => {
    const repository = createRepository();

    symlinkSync('target.js', join(repository, 'one.js'));
    git({ cwd: repository, args: ['add', 'one.js'] });
    commit({ repository });
    rmSync(join(repository, 'one.js'));
    writeFiles({ repository, files: { 'one.js': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'one.js'] });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'one.js' }), FORMATTED_CODE);
  });

  it('formats the staged version when the version on disk cannot be parsed', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'one.js': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'one.js'] });
    writeFiles({ repository, files: { 'one.js': UNFORMATTED_CODE + INVALID_CODE } });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'one.js' }), FORMATTED_CODE);
    assert.equal(readOnDisk({ repository, filePath: 'one.js' }), UNFORMATTED_CODE + INVALID_CODE);
  });

  it('refuses the commit when the staged version cannot be parsed', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'one.js': INVALID_CODE } });
    git({ cwd: repository, args: ['add', 'one.js'] });

    assert.throws(() => commit({ repository }), {
      stderr: /Prettier cannot parse the staged version of one\.js/
    });
    assert.equal(getStatus(repository), 'A  one.js\n');
  });

  it('formats a file whose name reads as a glob, and only that file', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { '1.js': FORMATTED_CODE } });
    git({ cwd: repository, args: ['add', '1.js'] });
    commit({ repository });
    writeFiles({ repository, files: { '?.js': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', '?.js'] });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: '?.js' }), FORMATTED_CODE);
    assert.equal(getStatus(repository), '');
  });

  it('formats the staged version of a file deleted from the disk after it was staged', () => {
    const repository = createRepository();

    writeFiles({ repository, files: { 'one.js': UNFORMATTED_CODE } });
    git({ cwd: repository, args: ['add', 'one.js'] });
    rmSync(join(repository, 'one.js'));
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'one.js' }), FORMATTED_CODE);
    assert.equal(getStatus(repository), ' D one.js\n');
  });

  it('leaves a file that .gitignore lists, added anyway, as it is', () => {
    const repository = createRepository();

    writeFiles({
      repository,
      files: { '.gitignore': 'generated.js\n', 'generated.js': UNFORMATTED_CODE }
    });
    git({ cwd: repository, args: ['add', '--force', '.gitignore', 'generated.js'] });
    commit({ repository });

    assert.equal(readCommitted({ repository, filePath: 'generated.js' }), UNFORMATTED_CODE);
  });
});
