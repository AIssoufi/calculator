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

/** Significant digits a result is rounded to, which hides float noise such as `0.30000000000000004`. */
export const DISPLAY_PRECISION_DIGITS = 12;

/** Divisor of the `%` key: it turns the entry into a fraction of 100. */
export const PERCENT_DIVISOR = 100;

/** Text the screen shows when an operation gives no finite result, such as a division by zero. */
export const ERROR_MESSAGE = 'Erreur';

/**
 * State of the engine before any key press, and after `AC`.
 *
 * @type {Readonly<import('./engine').CalculatorState>}
 */
export const INITIAL_STATE = Object.freeze({
    accumulator: null,
    pendingOperator: null,
    entry: EMPTY_ENTRY,
    justEvaluated: false,
    hasError: false
});
