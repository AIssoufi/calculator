/**
 * Prettier formats every file it supports, checked by `pnpm format:check` in the CI. The options
 * follow the style that most of the code already had: two-space indents, single quotes in the
 * scripts and double quotes in JSX, semicolons, lines of 100 characters at most, no trailing
 * commas and no parentheses around a single arrow function parameter.
 *
 * @type {import('prettier').Config}
 */
const config = {
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'none',
  arrowParens: 'avoid'
};

export default config;
