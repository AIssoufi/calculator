import {
  LINE_BREAK,
  LINE_BREAK_PATTERN,
  MERGE_SOURCE,
  TICKET_KEY,
  TICKET_NUMBER_PATTERN,
  TICKET_TRAILER_KEY
} from '../constants.mjs';
import { isNonEmptyString } from './strings.mjs';
import { getFooterTrailers, getParagraphs, isTrailerBlock } from './trailers.mjs';

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
  const hasTicketKey = value.startsWith(prefix);
  const hasTicketNumber = TICKET_NUMBER_PATTERN.test(value.slice(prefix.length));

  return hasTicketKey && hasTicketNumber;
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
  const hasTicketReference = getTicketReferences(message).length > 0;

  if (!isInputValid || hasTicketReference) {
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

  return [...lines.slice(0, insertIndex), ...insertedLines, ...lines.slice(insertIndex)].join(
    LINE_BREAK
  );
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
