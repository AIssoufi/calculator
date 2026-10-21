import type { CalculatorState } from './types';

/** The four arithmetic operators, as the engine and the `pressOperator` action name them. */
export const OPERATORS = Object.freeze({
    ADD: '+',
    SUBTRACT: '-',
    MULTIPLY: '*',
    DIVIDE: '/'
});

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

/**
 * Significant digits a result that is not a safe integer is rounded to, which hides float noise such
 * as `0.30000000000000004`.
 */
export const DISPLAY_PRECISION_DIGITS = 12;

/**
 * Smallest magnitude whose integer part holds more digits than {@link DISPLAY_PRECISION_DIGITS}:
 * past it, a rounded result is shown in exponent notation.
 */
export const ROUNDED_INTEGER_THRESHOLD = 10 ** DISPLAY_PRECISION_DIGITS;

/** Digits after the point of a mantissa, so the exponent notation keeps the display precision. */
export const EXPONENT_FRACTION_DIGITS = DISPLAY_PRECISION_DIGITS - 1;

/** Divisor of the `%` key: it turns the entry into a fraction of 100. */
export const PERCENT_DIVISOR = 100;

/** Text the screen shows when an operation gives no finite result, such as a division by zero. */
export const ERROR_MESSAGE = 'Erreur';

/** State of the engine before any key press, and after `AC`. */
export const INITIAL_STATE: Readonly<CalculatorState> = Object.freeze({
    accumulator: null,
    pendingOperator: null,
    entry: EMPTY_ENTRY,
    justEvaluated: false,
    hasError: false
});
