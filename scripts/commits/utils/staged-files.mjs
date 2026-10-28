import { basename, dirname, join } from 'node:path';
import {
  GIT_PATH_SEPARATOR,
  INDEX_LOCK_FILE,
  PATH_COMMIT_INDEX_PATTERN,
  RAW_DIFF_FIELD_SEPARATOR,
  RAW_DIFF_STATUS_PREFIX
} from '../constants.mjs';

/**
 * Reads the staged files from the output of `git diff --cached --raw -z --no-abbrev`, in which
 * each file is a line such as `:100644 100644 <old blob> <new blob> M`, then its path, each
 * ended by a NUL character. An entry that is not such a line, or that lacks its blob or its path,
 * is left out.
 *
 * @param {string} rawDiff - Output of the command, `''` when nothing is staged.
 * @returns {{ mode: string, blob: string, filePath: string }[]} Mode, blob and path of each file
 * in the index.
 * @example
 * parseRawDiff(':000000 100644 0000 c1b0 A\0one.js\0');
 * // [{ mode: '100644', blob: 'c1b0', filePath: 'one.js' }]
 */
export const parseRawDiff = rawDiff => {
  const fields = typeof rawDiff === 'string' ? rawDiff.split(GIT_PATH_SEPARATOR) : [];
  const stagedFiles = [];

  for (let index = 0; index + 1 < fields.length; index += 2) {
    const [status, filePath] = [fields[index], fields[index + 1]];
    const [, mode, , blob] = status
      .slice(RAW_DIFF_STATUS_PREFIX.length)
      .split(RAW_DIFF_FIELD_SEPARATOR);
    const isWellFormed = status.startsWith(RAW_DIFF_STATUS_PREFIX) && Boolean(blob && filePath);

    if (isWellFormed) {
      stagedFiles.push({ mode, blob, filePath });
    }
  }

  return stagedFiles;
};

/**
 * Gives the lock of the real index during a commit of some paths only, or `null` otherwise. Such a
 * commit is made from a temporary index, `next-index-<pid>.lock`, while the real index, which gets
 * the same paths, waits in `index.lock` next to it: git renames it to `index` after the commit.
 *
 * @param {string | undefined} indexFile - Value of `GIT_INDEX_FILE`, which git sets for its hooks.
 * @returns {string | null} Path of `index.lock`, or `null` when the commit uses the real index.
 * @example
 * getPathCommitIndexLock('/repo/.git/next-index-123.lock'); // '/repo/.git/index.lock'
 * getPathCommitIndexLock('.git/index'); // null
 */
export const getPathCommitIndexLock = indexFile => {
  const isPathCommit =
    typeof indexFile === 'string' && PATH_COMMIT_INDEX_PATTERN.test(basename(indexFile));

  return isPathCommit ? join(dirname(indexFile), INDEX_LOCK_FILE) : null;
};
