import { TICKET_KEY, TICKET_TRAILER_KEY } from './constants.mjs';
import { isNonEmptyString } from './utils/strings.mjs';
import { getTicketReferences, isTicketReference } from './utils/tickets.mjs';

const NEVER = 'never';

/**
 * Commit parsed by commitlint; the rules of this file read its raw message only.
 *
 * @typedef {object} ParsedCommit
 * @property {string} [raw] - Full commit message, comment lines included when read from the
 * message file of a hook.
 */

/**
 * Commitlint rule that requires the footer to name the ticket of the commit with a git trailer,
 * `Refs: CALC-<n>`, one ticket per trailer. It reads the trailers as `git interpret-trailers`
 * does, and also accepts an older message whose `Refs:` line is followed by a blank line.
 * Its signature is the one commitlint gives to every rule.
 *
 * @param {ParsedCommit} [parsed] - Commit to check.
 * @param {'always' | 'never'} [when] - `never` requires the footer to name no ticket at all.
 * Defaults to `always`.
 * @param {string} [ticketKey] - Key of the tickets of the repository. Defaults to `TICKET_KEY`,
 * also used when the value is not a non-empty string.
 * @returns {[boolean, string]} Whether the commit passes, and the message shown when it fails.
 */
export const footerTicketReference = (parsed, when, ticketKey) => {
  const key = isNonEmptyString(ticketKey) ? ticketKey : TICKET_KEY;
  const expectedTrailer = `${TICKET_TRAILER_KEY}: ${key}-<n>`;
  const references = getTicketReferences(parsed?.raw);
  const hasReference = references.length > 0;

  if (when === NEVER) {
    return [
      !hasReference,
      `the footer must not name a ticket with a "${TICKET_TRAILER_KEY}:" trailer`
    ];
  }

  if (!hasReference) {
    return [
      false,
      `the footer must name the ticket of the commit with a git trailer "${expectedTrailer}", ` +
        'in the last paragraph of the message'
    ];
  }

  const malformedReference = references.find(
    value => !isTicketReference({ value, ticketKey: key })
  );

  if (malformedReference !== undefined) {
    return [
      false,
      `"${TICKET_TRAILER_KEY}: ${malformedReference}" does not name a ticket of this repository: ` +
        `write "${expectedTrailer}", one ticket per trailer`
    ];
  }

  return [true, ''];
};
