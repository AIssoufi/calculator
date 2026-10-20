/**
 * Tells whether a value is a string with at least one character.
 *
 * @param {unknown} value - Any value.
 * @returns {boolean} `false` for `''`, `null`, `undefined` or a non-string.
 */
export const isNonEmptyString = value => typeof value === 'string' && value !== '';
