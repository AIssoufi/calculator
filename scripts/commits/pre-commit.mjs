// Git `pre-commit` hook, run by husky: it formats the staged files with Prettier, so that the
// commit holds them formatted. It formats the staged version of each file in the index, and the
// version on disk apart, so the unstaged changes of a file stay out of the commit. Deleted files,
// files that Prettier ignores and files it cannot parse by their name are left as they are, and
// staged code that Prettier cannot parse refuses the commit.
// Usage: node scripts/commits/pre-commit.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, getFileInfo, resolveConfig } from 'prettier';
import { PRETTIER_IGNORE_FILES, UNFORMATTED_INDEX_MODES } from './constants.mjs';
import { getPathCommitIndexLock, parseRawDiff } from './utils/staged-files.mjs';

/**
 * Runs git and gives back its output. Git hooks set `GIT_INDEX_FILE`, which this inherits, so a
 * commit of some paths only (`git commit -- <paths>`) reads and writes its own temporary index.
 *
 * @param {{ args: string[], input?: string, indexFile?: string }} params - Arguments, the text to
 * pass on stdin, and another index file to read and write.
 */
const git = ({ args, input, indexFile }) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    input,
    env: indexFile ? { ...process.env, GIT_INDEX_FILE: indexFile } : process.env
  });

/**
 * Gives the files added, copied, modified or changed in type in the index, such as a symbolic link
 * turned into a file, with their mode and blob. Without rename detection, a renamed file shows as
 * its new path, added.
 */
const getStagedFiles = () =>
  parseRawDiff(
    git({
      args: ['diff', '--cached', '--raw', '-z', '--no-abbrev', '--no-renames', '--diff-filter=ACMT']
    })
  );

/**
 * Formats a text as Prettier would format the file, or gives `null` when Prettier ignores it.
 *
 * @param {{ text: string, absolutePath: string, ignorePath: string[] }} params - Text, path of
 * the file it belongs to, and the ignore files of the repository.
 */
const formatText = async ({ text, absolutePath, ignorePath }) => {
  const { ignored, inferredParser } = await getFileInfo(absolutePath, { ignorePath });
  const isSkipped = ignored || !inferredParser;

  if (isSkipped) {
    return null;
  }

  const config = await resolveConfig(absolutePath);

  return format(text, { ...config, filepath: absolutePath });
};

/**
 * Formats the staged version of a file in the index, then its version on disk. A version on disk
 * that Prettier cannot parse, such as a change in progress, or a file deleted from the disk after
 * it was staged, stays as it is. Staged code that Prettier cannot parse fails the hook.
 *
 * @param {{ root: string, stagedFile: { mode: string, blob: string, filePath: string },
 * ignorePath: string[], pathCommitIndexLock: string | null }} params - Root of the repository,
 * the file in the index, the ignore files of the repository, and the lock of the real index
 * during a commit of some paths only.
 */
const formatStagedFile = async ({ root, stagedFile, ignorePath, pathCommitIndexLock }) => {
  const { mode, blob, filePath } = stagedFile;

  if (UNFORMATTED_INDEX_MODES.includes(mode)) {
    return;
  }

  const absolutePath = join(root, filePath);
  const stagedText = git({ args: ['cat-file', 'blob', blob] });
  let formattedStagedText;

  try {
    formattedStagedText = await formatText({ text: stagedText, absolutePath, ignorePath });
  } catch (error) {
    console.error(`pre-commit: Prettier cannot parse the staged version of ${filePath}.`);
    console.error(error.message);
    process.exitCode = 1;

    return;
  }

  if (formattedStagedText === null) {
    return;
  }

  if (formattedStagedText !== stagedText) {
    const formattedBlob = git({
      args: ['hash-object', '-w', '--no-filters', '--stdin'],
      input: formattedStagedText
    }).trim();

    const cacheInfo = `${mode},${formattedBlob},${filePath}`;

    git({ args: ['update-index', '--cacheinfo', cacheInfo] });

    if (pathCommitIndexLock) {
      git({ args: ['update-index', '--cacheinfo', cacheInfo], indexFile: pathCommitIndexLock });
    }
  }

  try {
    const diskText = readFileSync(absolutePath, 'utf8');
    const formattedDiskText = await formatText({ text: diskText, absolutePath, ignorePath });

    if (formattedDiskText !== diskText) {
      writeFileSync(absolutePath, formattedDiskText);
    }
  } catch {
    console.warn(`pre-commit: left ${filePath} as it is on disk, where Prettier cannot format it.`);
  }
};

const root = git({ args: ['rev-parse', '--show-toplevel'] }).trim();
const ignorePath = PRETTIER_IGNORE_FILES.map(ignoreFile => join(root, ignoreFile));
const pathCommitIndexLock = getPathCommitIndexLock(process.env.GIT_INDEX_FILE);

for (const stagedFile of getStagedFiles()) {
  await formatStagedFile({ root, stagedFile, ignorePath, pathCommitIndexLock });
}
