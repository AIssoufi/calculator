import {
  DISPLAY_PRECISION_DIGITS,
  EXPONENT_FRACTION_DIGITS,
  OPERATORS,
  ROUNDED_INTEGER_THRESHOLD,
  ZERO_ENTRY
} from './constants';
import type { Digit, Operator } from './types';

const SINGLE_DIGIT_PATTERN = /^[0-9]$/;
const ANY_DIGIT_PATTERN = /[0-9]/g;
const OPERATOR_SYMBOLS: readonly unknown[] = Object.values(OPERATORS);
/** Trailing zeros of a mantissa, with its point when nothing is left after it, as in `1.000e+21`. */
const MANTISSA_TRAILING_ZEROS_PATTERN = /\.?0+(?=e)/;

/** The two operands of an arithmetic operation. */
interface Operands {
  /** Left operand: the running total. */
  left: number;
  /** Right operand: the value of the entry. */
  right: number;
}

/** Parameters of {@link applyOperator}. */
interface ApplyOperatorParams extends Operands {
  /** Operator to apply; an unknown one returns the right operand unchanged. */
  operator: Operator;
}

/** Computation of each operator, keyed by its symbol. */
const OPERATIONS: Record<Operator, (operands: Operands) => number> = {
  [OPERATORS.ADD]: ({ left, right }) => left + right,
  [OPERATORS.SUBTRACT]: ({ left, right }) => left - right,
  [OPERATORS.MULTIPLY]: ({ left, right }) => left * right,
  [OPERATORS.DIVIDE]: ({ left, right }) => left / right
};

/**
 * Tells whether a key is a single digit from `0` to `9`.
 *
 * @param key - Key pressed, any value.
 * @returns `false` for anything else, such as `'12'`, `'.'`, `5` or `undefined`.
 */
export const isDigit = (key: unknown): key is Digit =>
  typeof key === 'string' && SINGLE_DIGIT_PATTERN.test(key);

/**
 * Tells whether a key is one of the four {@link OPERATORS}.
 *
 * @param key - Key pressed, any value.
 * @returns `false` for anything else, such as `'x'` or `undefined`.
 */
export const isOperator = (key: unknown): key is Operator => OPERATOR_SYMBOLS.includes(key);

/**
 * Counts the digits of an entry, leaving out its sign and its decimal point.
 *
 * @param entry - Entry of the engine, such as `'-1.05'`.
 * @returns The number of digits, `0` for an empty entry.
 */
export const countDigits = (entry: string): number => (entry.match(ANY_DIGIT_PATTERN) ?? []).length;

/**
 * Reads an entry as a number, including an unfinished one such as `'0.'` or `'-0'`.
 *
 * @param entry - Entry of the engine.
 * @returns Its value, or `0` when it holds no number, such as `''`.
 * @example parseEntry('-1.') // -1
 */
export const parseEntry = (entry: string): number => {
  const value = Number.parseFloat(entry);
  return Number.isFinite(value) ? value : 0;
};

/**
 * Formats a number for the screen, rounded to {@link DISPLAY_PRECISION_DIGITS} significant digits
 * so float noise does not show. A safe integer is exact, so it is shown in full; a value that
 * rounding leaves without a fraction, or with wrong trailing digits, because its integer part holds
 * all the significant digits, is shown in exponent notation, so a rounded result never looks exact.
 *
 * @param value - Number to show.
 * @returns A safe integer in full; from {@link ROUNDED_INTEGER_THRESHOLD}, the exponent notation
 * without trailing zeros; any other value rounded to {@link DISPLAY_PRECISION_DIGITS} significant
 * digits; or `'0'` for a value that is not a finite number: the engine reports those as an error
 * before it formats anything.
 * @example formatNumber(0.1 + 0.2) // '0.3'
 * @example formatNumber(123456789 * 123456789) // '1.52415787502e+16'
 */
export const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return ZERO_ENTRY;
  }

  if (Number.isSafeInteger(value)) {
    return String(value);
  }

  const rounded = Number(value.toPrecision(DISPLAY_PRECISION_DIGITS));
  const integerPartFillsPrecision = Math.abs(rounded) >= ROUNDED_INTEGER_THRESHOLD;

  if (integerPartFillsPrecision) {
    return value
      .toExponential(EXPONENT_FRACTION_DIGITS)
      .replace(MANTISSA_TRAILING_ZEROS_PATTERN, '');
  }

  return String(rounded);
};

/**
 * Applies an operator to two operands.
 *
 * @returns The result, which is `Infinity` or `NaN` for a division by zero: the caller checks it.
 * @example applyOperator({ left: 2, operator: '*', right: 3 }) // 6
 */
export const applyOperator = ({ left, operator, right }: ApplyOperatorParams): number => {
  if (!isOperator(operator)) {
    return right;
  }

  return OPERATIONS[operator]({ left, right });
};
