import {
  COMMENT_PREFIX,
  CONTINUATION_LINE_PATTERN,
  GIT_GENERATED_PREFIXES,
  LINE_BREAK_PATTERN,
  MAX_OTHER_LINES_PER_TRAILER,
  SCISSORS_LINE,
  TRAILER_LINE_PATTERN
} from '../constants.mjs';

/**
 * A git trailer of a commit message, such as `Refs: CALC-17`.
 *
 * @typedef {object} Trailer
 * @property {string} key - Token before the colon, as written: `Refs`, `Co-Authored-By`.
 * @property {string} value - Text after the colon, trimmed, with its continuation lines joined
 * by a space.
 */

const isBlankLine = line => line.trim() === '';

const isGitGeneratedLine = line => GIT_GENERATED_PREFIXES.some(prefix => line.startsWith(prefix));

/**
 * Splits the lines of a commit message into paragraphs, as git reads the message once cleaned up:
 * comment lines are skipped and the scissors line of `git commit --verbose` ends the message.
 *
 * @param {string[]} lines - Lines of the message file.
 * @returns {number[][]} Indices of the lines of each paragraph, in order; `[]` without any text.
 * @example
 * getParagraphs(['feat: add a key', '', '# comment', 'Refs: CALC-9']);
 * // [[0], [3]]
 */
export const getParagraphs = lines => {
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
 * @example
 * isTrailerBlock(['Refs: CALC-9', 'Co-Authored-By: A <a@example.com>']); // true
 * isTrailerBlock(['BREAKING CHANGE: the key is gone', 'Refs: CALC-9']); // false
 */
export const isTrailerBlock = paragraph => {
  let trailerCount = 0;
  let otherCount = 0;
  let pendingContinuationCount = 0;
  let hasGitGeneratedLine = false;

  // Read from the bottom, as git does: a continuation line counts only once a trailer sits above it.
  for (const line of [...paragraph].reverse()) {
    const isGitLine = isGitGeneratedLine(line);
    const isTrailerLine = isGitLine || TRAILER_LINE_PATTERN.test(line);

    hasGitGeneratedLine ||= isGitLine;

    if (isTrailerLine) {
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
