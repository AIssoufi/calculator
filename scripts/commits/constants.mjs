/** Key of the tickets of this repository: the GitHub autolink turns `CALC-17` into a link to issue #17. */
export const TICKET_KEY = 'CALC';

/** Key of the git trailer that names the ticket of a commit, as in `Refs: CALC-17`. */
export const TICKET_TRAILER_KEY = 'Refs';

/** Name of the commitlint rule that requires a `Refs: CALC-<n>` trailer. */
export const TICKET_RULE_NAME = 'footer-ticket-reference';

/** Number of a ticket: digits without a leading zero, as in the `17` of `CALC-17`. */
export const TICKET_NUMBER_PATTERN = /^[1-9]\d*$/;

/** Value of `$2` in `prepare-commit-msg` when git prepares the message of a merge commit. */
export const MERGE_SOURCE = 'merge';

/** Line break that the hook writes back to the message file. */
export const LINE_BREAK = '\n';

/** Line breaks of a message file, Windows ones included: git cleans them up anyway. */
export const LINE_BREAK_PATTERN = /\r?\n/;

/** A trailer line as git reads it: a token of letters, digits and dashes, then `:`. */
export const TRAILER_LINE_PATTERN = /^([A-Za-z0-9-]+)[ \t]*:(.*)$/;

/** A line that starts with a blank continues the trailer above it. */
export const CONTINUATION_LINE_PATTERN = /^[ \t]/;

/** First character of the comment lines git writes in the message file and strips after editing. */
export const COMMENT_PREFIX = '#';

/** Line above the diff of `git commit --verbose`: git drops it and everything below it. */
export const SCISSORS_LINE = '# ------------------------ >8 ------------------------';

/**
 * Prefixes of the lines git writes itself in a trailer block: they let git read a block that
 * holds other lines as trailers, as `git interpret-trailers` does.
 */
export const GIT_GENERATED_PREFIXES = Object.freeze([
  'Signed-off-by: ',
  '(cherry picked from commit '
]);

/**
 * Most other lines per trailer line in a block that git still reads as trailers thanks to a
 * git-generated line: three, so trailers make at least 25% of the block.
 */
export const MAX_OTHER_LINES_PER_TRAILER = 3;

/** Header of a release commit or pull request of release-please, such as `chore(master): release 1.2.0`. */
export const RELEASE_PLEASE_HEADER_PATTERN =
  /^chore(\([\w./-]+\))?: release( [\w@./-]+)? v?\d+\.\d+\.\d+/;

/** Sign-off trailer that Dependabot adds to each of its commits. */
export const DEPENDABOT_SIGN_OFF_PATTERN = /^Signed-off-by: dependabot\[bot\]/m;

/** Modes of the index entries that the pre-commit hook leaves out: symbolic links and submodules. */
export const UNFORMATTED_INDEX_MODES = Object.freeze(['120000', '160000']);

/** Files that list what Prettier skips, as its command line reads them by default. */
export const PRETTIER_IGNORE_FILES = Object.freeze(['.gitignore', '.prettierignore']);

/** Separator of the file names that git prints with `-z`, which keeps unusual names intact. */
export const GIT_PATH_SEPARATOR = '\0';

/** Temporary index from which git makes a commit of some paths only (`git commit -- <paths>`). */
export const PATH_COMMIT_INDEX_PATTERN = /^next-index-\d+\.lock$/;

/** Lock of the real index, which git renames to `index` once the commit is made. */
export const INDEX_LOCK_FILE = 'index.lock';

/** First character of each file line of `git diff --raw`. */
export const RAW_DIFF_STATUS_PREFIX = ':';

/** Separator of the modes, blobs and status of a file line of `git diff --raw`. */
export const RAW_DIFF_FIELD_SEPARATOR = ' ';
