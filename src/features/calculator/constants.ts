import type { CalculatorState, Operator } from './types';

/** The four arithmetic operators, as the engine and the `pressOperator` action name them. */
export const OPERATORS = Object.freeze({
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: '*',
  DIVIDE: '/'
});

/** Symbols of the {@link OPERATORS}, typed loosely so any key can be looked up among them. */
export const OPERATOR_SYMBOLS: readonly unknown[] = Object.values(OPERATORS);

/** Separator of the decimal part of an entry; an entry holds one at most. */
export const DECIMAL_POINT = '.';

/** Prefix of a negative entry. */
export const MINUS_SIGN = '-';

/** Entry of the engine when nothing has been typed since the last operator. */
export const EMPTY_ENTRY = '';

/** Text of a zero entry, and what the screen shows when there is nothing else to show. */
export const ZERO_ENTRY = '0';

/** Most digits an entry can hold, so a typed number stays readable on the screen. */
export const MAX_ENTRY_DIGITS = 9;

/** A key that is one digit from `0` to `9`, and nothing else. */
export const SINGLE_DIGIT_PATTERN = /^[0-9]$/;

/** Every digit of an entry, leaving out its sign and its decimal point. */
export const ANY_DIGIT_PATTERN = /[0-9]/g;

/**
 * Significant digits a result that is not a safe integer is rounded to, which hides float noise
 * such as `0.30000000000000004`.
 */
export const DISPLAY_PRECISION_DIGITS = 12;

/**
 * Smallest magnitude whose integer part holds {@link DISPLAY_PRECISION_DIGITS} digits, which leaves
 * no digit to a fraction: from it, a rounded result is shown in exponent notation.
 */
export const ROUNDED_INTEGER_THRESHOLD = 10 ** (DISPLAY_PRECISION_DIGITS - 1);

/** Digits after the point of a mantissa, so the exponent notation keeps the display precision. */
export const EXPONENT_FRACTION_DIGITS = DISPLAY_PRECISION_DIGITS - 1;

/**
 * Trailing zeros of a mantissa, with its point when nothing is left after it, as in `1.000e+21`.
 */
export const MANTISSA_TRAILING_ZEROS_PATTERN = /\.?0+(?=e)/;

/**
 * Significant digits of the larger operand that a sum or a difference keeps. Below the float
 * precision of about 16 digits, it drops the noise left when close values cancel out, such as
 * `5.55e-17` for `0.1 + 0.2 - 0.3`.
 */
export const ADDITIVE_PRECISION_DIGITS = 15;

/** Divisor of the `%` key: it turns the entry into a fraction of 100. */
export const PERCENT_DIVISOR = 100;

/**
 * Pending operators after which `%` takes a share of the running total, so `200 + 10 %` adds `20`;
 * after any other operator, `%` only divides the entry by {@link PERCENT_DIVISOR}.
 */
export const SHARE_OF_TOTAL_OPERATORS: readonly Operator[] = Object.freeze([
  OPERATORS.ADD,
  OPERATORS.SUBTRACT
]);

/** Text the screen shows when an operation gives no finite result, such as a division by zero. */
export const ERROR_MESSAGE = 'Erreur';

/** State of the engine before any key press, and after `AC`. */
export const INITIAL_STATE: Readonly<CalculatorState> = Object.freeze({
  accumulator: null,
  pendingOperator: null,
  entry: EMPTY_ENTRY,
  result: null,
  justEvaluated: false,
  lastOperation: null,
  hasError: false
});
