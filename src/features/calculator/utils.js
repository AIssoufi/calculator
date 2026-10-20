import { DISPLAY_PRECISION_DIGITS, OPERATORS, ZERO_ENTRY } from './constants';

const SINGLE_DIGIT_PATTERN = /^[0-9]$/;
const ANY_DIGIT_PATTERN = /[0-9]/g;
const OPERATOR_SYMBOLS = Object.values(OPERATORS);

/**
 * @typedef {object} ApplyOperatorParams
 * @property {number} left - Left operand: the running total.
 * @property {string} operator - One of {@link OPERATORS}.
 * @property {number} right - Right operand: the value of the entry.
 */

/** Computation of each operator, keyed by its symbol. */
const OPERATIONS = {
    [OPERATORS.ADD]: ({ left, right }) => left + right,
    [OPERATORS.SUBTRACT]: ({ left, right }) => left - right,
    [OPERATORS.MULTIPLY]: ({ left, right }) => left * right,
    [OPERATORS.DIVIDE]: ({ left, right }) => left / right
};

/**
 * Tells whether a key is a single digit from `0` to `9`.
 *
 * @param {unknown} key - Key pressed, any value.
 * @returns {boolean} `false` for anything else, such as `'12'`, `'.'`, `5` or `undefined`.
 */
export const isDigit = key => typeof key === 'string' && SINGLE_DIGIT_PATTERN.test(key);

/**
 * Tells whether a key is one of the four {@link OPERATORS}.
 *
 * @param {unknown} key - Key pressed, any value.
 * @returns {boolean} `false` for anything else, such as `'x'` or `undefined`.
 */
export const isOperator = key => OPERATOR_SYMBOLS.includes(key);

/**
 * Counts the digits of an entry, leaving out its sign and its decimal point.
 *
 * @param {string} entry - Entry of the engine, such as `'-1.05'`.
 * @returns {number} The number of digits, `0` for an empty entry.
 */
export const countDigits = entry => (entry.match(ANY_DIGIT_PATTERN) ?? []).length;

/**
 * Reads an entry as a number, including an unfinished one such as `'0.'` or `'-0'`.
 *
 * @param {string} entry - Entry of the engine.
 * @returns {number} Its value, or `0` when it holds no number, such as `''`.
 * @example parseEntry('-1.') // -1
 */
export const parseEntry = entry => {
    const value = Number.parseFloat(entry);
    return Number.isFinite(value) ? value : 0;
};

/**
 * Formats a number for the screen, rounded to {@link DISPLAY_PRECISION_DIGITS} significant digits
 * so float noise does not show.
 *
 * @param {number} value - Number to show.
 * @returns {string} The rounded number, or `'0'` for a value that is not a finite number: the engine
 * reports those as an error before it formats anything.
 * @example formatNumber(0.1 + 0.2) // '0.3'
 */
export const formatNumber = value => {
    if (!Number.isFinite(value)) {
        return ZERO_ENTRY;
    }

    return String(Number(value.toPrecision(DISPLAY_PRECISION_DIGITS)));
};

/**
 * Applies an operator to two operands.
 *
 * @param {ApplyOperatorParams} params - The operands and the operator.
 * @returns {number} The result, which is `Infinity` or `NaN` for a division by zero: the caller
 * checks it. An unknown operator returns the right operand unchanged.
 * @example applyOperator({ left: 2, operator: '*', right: 3 }) // 6
 */
export const applyOperator = ({ left, operator, right }) => {
    if (!isOperator(operator)) {
        return right;
    }

    return OPERATIONS[operator]({ left, right });
};
