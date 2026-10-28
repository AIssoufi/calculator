import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getPathCommitIndexLock, parseRawDiff } from './staged-files.mjs';

const EMPTY_BLOB = '0000000000000000000000000000000000000000';
const BLOB = 'c1b0730e0133447badcfd47fd144e2548070b06e';

describe('parseRawDiff', () => {
  it('reads the mode, the new blob and the path of each file', () => {
    const rawDiff =
      `:000000 100644 ${EMPTY_BLOB} ${BLOB} A\0one.js\0` +
      `:100644 100755 ${EMPTY_BLOB} ${BLOB} M\0bin/two.sh\0`;

    assert.deepEqual(parseRawDiff(rawDiff), [
      { mode: '100644', blob: BLOB, filePath: 'one.js' },
      { mode: '100755', blob: BLOB, filePath: 'bin/two.sh' }
    ]);
  });

  it('keeps a path that holds spaces, glob characters or a line break as it is', () => {
    const filePath = 'a [b]?*\nc.js';

    assert.deepEqual(parseRawDiff(`:000000 100644 ${EMPTY_BLOB} ${BLOB} A\0${filePath}\0`), [
      { mode: '100644', blob: BLOB, filePath }
    ]);
  });

  it('gives no file for an empty or missing output', () => {
    assert.deepEqual(parseRawDiff(''), []);
    assert.deepEqual(parseRawDiff(undefined), []);
    assert.deepEqual(parseRawDiff(null), []);
  });

  it('leaves out a status without its path', () => {
    assert.deepEqual(parseRawDiff(`:000000 100644 ${EMPTY_BLOB} ${BLOB} A\0`), []);
  });

  it('leaves out an entry that is not a file line of the raw format', () => {
    assert.deepEqual(parseRawDiff('one.js\0two.js\0'), []);
    assert.deepEqual(parseRawDiff(':100644\0one.js\0'), []);
    assert.deepEqual(parseRawDiff(`:000000 100644 ${EMPTY_BLOB} ${BLOB} A\0\0`), []);
  });
});

describe('getPathCommitIndexLock', () => {
  it('gives the real index lock next to the temporary index of a commit of some paths', () => {
    assert.equal(getPathCommitIndexLock('/repo/.git/next-index-123.lock'), '/repo/.git/index.lock');
    assert.equal(
      getPathCommitIndexLock('/repo/.git/worktrees/x/next-index-9.lock'),
      '/repo/.git/worktrees/x/index.lock'
    );
  });

  it('gives null when the commit uses the real index', () => {
    assert.equal(getPathCommitIndexLock('.git/index'), null);
    assert.equal(getPathCommitIndexLock('/repo/.git/index.lock'), null);
  });

  it('gives null for a name close to the temporary index', () => {
    assert.equal(getPathCommitIndexLock('/repo/.git/next-index-.lock'), null);
    assert.equal(getPathCommitIndexLock('/repo/.git/next-index-12.lock.bak'), null);
    assert.equal(getPathCommitIndexLock('/repo/next-index-12.lock/index'), null);
  });

  it('gives null without an index file', () => {
    assert.equal(getPathCommitIndexLock(''), null);
    assert.equal(getPathCommitIndexLock(undefined), null);
    assert.equal(getPathCommitIndexLock(null), null);
  });
});
