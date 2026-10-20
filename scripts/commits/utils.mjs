import {
    COMMENT_PREFIX,
    DEPENDABOT_SIGN_OFF_PATTERN,
    GIT_GENERATED_PREFIXES,
    MAX_OTHER_LINES_PER_TRAILER,
    MERGE_SOURCE,
    RELEASE_PLEASE_HEADER_PATTERN,
    SCISSORS_LINE,
    TICKET_KEY,
    TICKET_TRAILER_KEY
} from './constants.mjs';

const LINE_BREAK = '\n';

/** Line breaks of a message file, Windows ones included: git cleans them up anyway. */
const LINE_BREAK_PATTERN = /\r?\n/;

/** A trailer line as git reads it: a token of letters, digits and dashes, then `:`. */
const TRAILER_LINE_PATTERN = /^([A-Za-z0-9-]+)[ \t]*:(.*)$/;

/** A line that starts with a blank continues the trailer above it. */
const CONTINUATION_LINE_PATTERN = /^[ \t]/;

const TICKET_NUMBER_PATTERN = /^[1-9]\d*$/;

/**
 * A git trailer of a commit message, such as `Refs: CALC-17`.
 *
 * @typedef {object} Trailer
 * @property {string} key - Token before the colon, as written: `Refs`, `Co-Authored-By`.
 * @property {string} value - Text after the colon, trimmed, with its continuation lines joined
 * by a space.
 */

/**
 * @typedef {object} IsTicketReferenceParams
 * @property {unknown} value - Text to check, such as a trailer value or a branch name.
 * @property {string} [ticketKey] - Key of the tickets of the repository. Defaults to `TICKET_KEY`.
 */

/**
 * @typedef {object} AddTicketReferenceParams
 * @property {string} [message] - Content of the commit message file, comments included.
 * Defaults to `''`.
 * @property {string} reference - Ticket to name, such as `CALC-17`.
 */

/**
 * @typedef {object} PrepareCommitMessageParams
 * @property {string} [message] - Content of the commit message file, comments included.
 * Defaults to `''`.
 * @property {string} [branch] - Current branch, `''` on a detached HEAD.
 * @property {string} [source] - Source of the message given by git as `$2` of the hook:
 * `message`, `template`, `merge`, `squash`, `commit` or nothing.
 */

/**
 * Tells whether a value is a string with at least one character.
 *
 * @param {unknown} value - Any value.
 * @returns {boolean} `false` for `''`, `null`, `undefined` or a non-string.
 */
export const isNonEmptyString = value => typeof value === 'string' && value !== '';

const isBlankLine = line => line.trim() === '';

const isGitGeneratedLine = line => GIT_GENERATED_PREFIXES.some(prefix => line.startsWith(prefix));

/**
 * Splits the lines of a commit message into paragraphs, as git reads the message once cleaned up:
 * comment lines are skipped and the scissors line of `git commit --verbose` ends the message.
 *
 * @param {string[]} lines - Lines of the message file.
 * @returns {number[][]} Indices of the lines of each paragraph, in order.
 */
const getParagraphs = lines => {
    const paragraphs = [];
    let paragraph = [];

    for (const [index, line] of lines.entries()) {
        if (line.trimEnd() === SCISSORS_LINE) {
            break;
        }

        if (line.startsWith(COMMENT_PREFIX)) {
            continue;
        }

        if (!isBlankLine(line)) {
            paragraph.push(index);
            continue;
        }

        if (paragraph.length > 0) {
            paragraphs.push(paragraph);
            paragraph = [];
        }
    }

    if (paragraph.length > 0) {
        paragraphs.push(paragraph);
    }

    return paragraphs;
};

/**
 * Tells whether git reads a paragraph as a block of trailers, with the rules of
 * `git interpret-trailers`: only trailers, or enough trailers next to a line git writes itself,
 * such as `Signed-off-by:`. A line that starts with a blank continues the trailer above it.
 *
 * @param {string[]} paragraph - Lines of the paragraph.
 * @returns {boolean} `false` for an empty paragraph.
 */
const isTrailerBlock = paragraph => {
    let trailerCount = 0;
    let otherCount = 0;
    let pendingContinuationCount = 0;
    let hasGitGeneratedLine = false;

    // Read from the bottom, as git does: a continuation line counts only once a trailer sits above it.
    for (const line of [...paragraph].reverse()) {
        const isGitLine = isGitGeneratedLine(line);

        hasGitGeneratedLine ||= isGitLine;

        if (isGitLine || TRAILER_LINE_PATTERN.test(line)) {
            trailerCount += 1;
            pendingContinuationCount = 0;
        } else if (CONTINUATION_LINE_PATTERN.test(line)) {
            pendingContinuationCount += 1;
        } else {
            otherCount += 1 + pendingContinuationCount;
            pendingContinuationCount = 0;
        }
    }

    otherCount += pendingContinuationCount;

    const hasOnlyTrailers = trailerCount > 0 && otherCount === 0;
    const hasEnoughTrailersNextToGitLine =
        hasGitGeneratedLine && trailerCount * MAX_OTHER_LINES_PER_TRAILER >= otherCount;

    return hasOnlyTrailers || hasEnoughTrailersNextToGitLine;
};

/**
 * Reads the trailers of a trailer block, joining each continuation line to the trailer above it.
 *
 * @param {string[]} paragraph - Lines of a paragraph that `isTrailerBlock` accepts.
 * @returns {Trailer[]} Trailers in order; lines such as `(cherry picked from commit …)` are left out.
 */
const parseTrailers = paragraph => {
    const trailers = [];
    let current = null;

    for (const line of paragraph) {
        const match = TRAILER_LINE_PATTERN.exec(line);
        const isContinuation = current !== null && CONTINUATION_LINE_PATTERN.test(line);

        if (match) {
            current = { key: match[1], value: match[2].trim() };
            trailers.push(current);
        } else if (isContinuation) {
            current.value = `${current.value} ${line.trim()}`.trim();
        } else {
            current = null;
        }
    }

    return trailers;
};

/**
 * Lists the trailers of the footer of a commit message: the trailer block of its last paragraph,
 * as `git interpret-trailers --parse` lists it, plus the trailer blocks right above it, so that an
 * older message whose `Refs:` line is followed by a blank line still counts. The first paragraph,
 * the header, never holds trailers.
 *
 * @param {unknown} message - Commit message, comment lines included or not.
 * @returns {Trailer[]} Trailers from top to bottom; `[]` when the message has none or is not text.
 * @example
 * getFooterTrailers('feat: add a key\n\nRefs: CALC-9\nCo-Authored-By: A <a@example.com>\n');
 * // [{ key: 'Refs', value: 'CALC-9' }, { key: 'Co-Authored-By', value: 'A <a@example.com>' }]
 */
export const getFooterTrailers = message => {
    if (typeof message !== 'string') {
        return [];
    }

    const lines = message.split(LINE_BREAK_PATTERN);
    const paragraphs = getParagraphs(lines).map(paragraph => paragraph.map(index => lines[index]));
    const [, ...bodyParagraphs] = paragraphs;
    const footerStart = bodyParagraphs.findLastIndex(paragraph => !isTrailerBlock(paragraph)) + 1;

    return bodyParagraphs.slice(footerStart).flatMap(parseTrailers);
};

/**
 * Lists the values of the `Refs:` trailers of the footer of a commit message, whatever the case
 * of their key, as git compares trailer keys.
 *
 * @param {unknown} message - Commit message, comment lines included or not.
 * @returns {string[]} Values as written, valid or not, such as `['CALC-17']`; `[]` without any.
 */
export const getTicketReferences = message => {
    const ticketTrailerKey = TICKET_TRAILER_KEY.toLowerCase();

    return getFooterTrailers(message)
        .filter(({ key }) => key.toLowerCase() === ticketTrailerKey)
        .map(({ value }) => value);
};

/**
 * Tells whether a text is exactly one ticket of the repository: its key, a dash and a number
 * without leading zero, such as `CALC-17`.
 *
 * @param {IsTicketReferenceParams} params
 * @returns {boolean} `false` for `calc-17`, `CALC-017`, `CALC-17 CALC-18`, `#17` or a non-string.
 */
export const isTicketReference = ({ value, ticketKey = TICKET_KEY } = {}) => {
    if (!isNonEmptyString(value) || !isNonEmptyString(ticketKey)) {
        return false;
    }

    const prefix = `${ticketKey}-`;

    return value.startsWith(prefix) && TICKET_NUMBER_PATTERN.test(value.slice(prefix.length));
};

/**
 * Adds a `Refs:` trailer to a commit message that has none. The trailer goes first in the trailer
 * block of the last paragraph, next to an existing `Co-Authored-By:`, or else in a new last
 * paragraph; the comment lines git adds below the message stay below it. An empty message gets
 * the trailer below an empty header line, ready to be typed in the editor.
 *
 * @param {AddTicketReferenceParams} params
 * @returns {string} The message with the trailer, or the same message when its footer already
 * has a `Refs:` trailer, valid or not, or when the reference is not a non-empty string.
 * @example
 * addTicketReference({ message: 'feat: add a key\n', reference: 'CALC-9' });
 * // 'feat: add a key\n\nRefs: CALC-9\n'
 */
export const addTicketReference = ({ message = '', reference } = {}) => {
    const isInputValid = typeof message === 'string' && isNonEmptyString(reference);

    if (!isInputValid || getTicketReferences(message).length > 0) {
        return message;
    }

    const trailer = `${TICKET_TRAILER_KEY}: ${reference}`;
    const lines = message.split(LINE_BREAK_PATTERN);
    const paragraphs = getParagraphs(lines);
    const lastParagraph = paragraphs.at(-1);

    if (!lastParagraph) {
        return ['', '', trailer, ...lines].join(LINE_BREAK);
    }

    const hasBody = paragraphs.length > 1;
    const hasTrailerBlock = hasBody && isTrailerBlock(lastParagraph.map(index => lines[index]));
    const insertIndex = hasTrailerBlock ? lastParagraph[0] : lastParagraph.at(-1) + 1;
    const insertedLines = hasTrailerBlock ? [trailer] : ['', trailer];

    return [...lines.slice(0, insertIndex), ...insertedLines, ...lines.slice(insertIndex)].join(LINE_BREAK);
};

/**
 * Prepares a commit message in the `prepare-commit-msg` hook: on a branch named after a ticket,
 * such as `CALC-17`, it adds `Refs: CALC-17` when the footer has no `Refs:` trailer yet.
 * A merge commit, a detached HEAD or another branch leaves the message as it is.
 *
 * @param {PrepareCommitMessageParams} params
 * @returns {string} The message to write back to the message file.
 */
export const prepareCommitMessage = ({ message = '', branch, source } = {}) => {
    const isMergeCommit = source === MERGE_SOURCE;
    const isTicketBranch = isTicketReference({ value: branch });

    if (isMergeCommit || !isTicketBranch) {
        return message;
    }

    return addTicketReference({ message, reference: branch });
};

/**
 * Tells whether a commit comes from a bot whose messages this repository does not control:
 * a release of release-please or a dependency update of Dependabot. Commitlint ignores them.
 *
 * @param {unknown} message - Full commit message.
 * @returns {boolean} `false` for any other message or a non-string.
 */
export const isBotCommit = message => {
    if (typeof message !== 'string') {
        return false;
    }

    const isReleasePleaseCommit = RELEASE_PLEASE_HEADER_PATTERN.test(message);
    const isDependabotCommit = DEPENDABOT_SIGN_OFF_PATTERN.test(message);

    return isReleasePleaseCommit || isDependabotCommit;
};
