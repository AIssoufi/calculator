import {
    DECIMAL_POINT,
    EMPTY_ENTRY,
    ERROR_MESSAGE,
    INITIAL_STATE,
    MAX_ENTRY_DIGITS,
    MINUS_SIGN,
    PERCENT_DIVISOR,
    ZERO_ENTRY
} from './constants';
import { applyOperator, countDigits, formatNumber, isDigit, isOperator, parseEntry } from './utils';

/**
 * State of a pocket calculator that evaluates from left to right: `2 + 3 × 4 =` gives `20`.
 * The engine is framework-free: each key press is a pure function from a state to the next one.
 *
 * @typedef {object} CalculatorState
 * @property {number | null} accumulator - Running total, the left operand of the next operator;
 * `null` until an operator is pressed.
 * @property {string | null} pendingOperator - Operator waiting for its right operand, one of
 * `OPERATORS`, or `null`.
 * @property {string} entry - Number being typed, kept as text so `0.` and `1.0` show as typed;
 * `''` when nothing has been typed since the last operator.
 * @property {boolean} justEvaluated - Whether the entry holds a computed value, after `=` or `%`:
 * the next digit or decimal point replaces it instead of extending it.
 * @property {boolean} hasError - Whether the last operation gave no finite result; only a digit,
 * a decimal point, `C` or `AC` leave this state.
 */

/**
 * @typedef {object} InputDigitParams
 * @property {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @property {string} digit - Digit pressed, from `'0'` to `'9'`; any other value is ignored.
 */

/**
 * @typedef {object} ChooseOperatorParams
 * @property {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @property {string} operator - Operator pressed, one of `OPERATORS`; any other value is ignored.
 */

/** @type {Readonly<CalculatorState>} */
const ERROR_STATE = Object.freeze({ ...INITIAL_STATE, hasError: true });

const NEGATIVE_ZERO_ENTRY = MINUS_SIGN + ZERO_ENTRY;

/** Gives the state a typed character starts from: an error or a computed entry is dropped first. */
const getEditableState = state => {
    if (state.hasError) {
        return INITIAL_STATE;
    }

    if (state.justEvaluated) {
        return { ...state, entry: EMPTY_ENTRY, justEvaluated: false };
    }

    return state;
};

/** Appends a digit to an entry, replacing a lone leading zero so `0` then `7` gives `7`, not `07`. */
const appendDigit = ({ entry, digit }) => {
    const isZeroEntry = entry === ZERO_ENTRY || entry === NEGATIVE_ZERO_ENTRY;
    return isZeroEntry ? entry.slice(0, -ZERO_ENTRY.length) + digit : entry + digit;
};

/** Gives the state holding a result as its entry, or the error state when the result is not finite. */
const toResultState = result => {
    if (!Number.isFinite(result)) {
        return ERROR_STATE;
    }

    return { ...INITIAL_STATE, entry: formatNumber(result), justEvaluated: true };
};

/**
 * Types a digit at the end of the entry.
 * After `=` or `%` it starts a new entry, and after an error it starts a new calculation.
 * A digit beyond {@link MAX_ENTRY_DIGITS} is ignored.
 *
 * @param {InputDigitParams} [params] - The current state and the digit pressed.
 * @returns {CalculatorState} The next state, or the same one for an invalid digit.
 */
export const inputDigit = ({ state = INITIAL_STATE, digit } = {}) => {
    if (!isDigit(digit)) {
        return state;
    }

    const editableState = getEditableState(state);

    if (countDigits(editableState.entry) >= MAX_ENTRY_DIGITS) {
        return editableState;
    }

    return { ...editableState, entry: appendDigit({ entry: editableState.entry, digit }) };
};

/**
 * Types the decimal point: an empty entry becomes `0.`, and a second point is ignored.
 *
 * @param {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @returns {CalculatorState} The next state.
 */
export const inputDecimalPoint = (state = INITIAL_STATE) => {
    const editableState = getEditableState(state);

    if (editableState.entry.includes(DECIMAL_POINT)) {
        return editableState;
    }

    const integerPart = editableState.entry === EMPTY_ENTRY ? ZERO_ENTRY : editableState.entry;
    return { ...editableState, entry: integerPart + DECIMAL_POINT };
};

/**
 * Presses an operator: applies the pending operator to the running total and the entry, shows the
 * new total, then waits for the next operand. Pressed right after another operator, it replaces it.
 * After `=`, it continues from the result.
 *
 * @param {ChooseOperatorParams} [params] - The current state and the operator pressed.
 * @returns {CalculatorState} The next state, the error state when the total is not finite, or the
 * same state for an invalid operator or during an error.
 */
export const chooseOperator = ({ state = INITIAL_STATE, operator } = {}) => {
    if (state.hasError || !isOperator(operator)) {
        return state;
    }

    if (state.entry === EMPTY_ENTRY) {
        return { ...state, accumulator: state.accumulator ?? 0, pendingOperator: operator };
    }

    const operand = parseEntry(state.entry);
    const total = state.pendingOperator === null
        ? operand
        : applyOperator({ left: state.accumulator ?? 0, operator: state.pendingOperator, right: operand });

    if (!Number.isFinite(total)) {
        return ERROR_STATE;
    }

    return { ...INITIAL_STATE, accumulator: total, pendingOperator: operator };
};

/**
 * Presses `=`: applies the pending operator and shows the result, which the next operator continues
 * from. With no operand after the operator, or no operator at all, the shown value becomes the result.
 *
 * @param {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @returns {CalculatorState} The next state, the error state when the result is not finite, or the
 * same state when there is nothing to evaluate.
 */
export const evaluate = (state = INITIAL_STATE) => {
    const hasEntry = state.entry !== EMPTY_ENTRY;
    const hasValueToShow = hasEntry || state.accumulator !== null;
    const canEvaluate = !state.hasError && hasValueToShow;

    if (!canEvaluate) {
        return state;
    }

    const isOperationComplete = hasEntry && state.pendingOperator !== null;

    if (isOperationComplete) {
        return toResultState(applyOperator({
            left: state.accumulator ?? 0,
            operator: state.pendingOperator,
            right: parseEntry(state.entry)
        }));
    }

    return toResultState(hasEntry ? parseEntry(state.entry) : state.accumulator);
};

/**
 * Presses `±`: flips the sign of the entry. An empty entry becomes `-0`, so the digits typed next
 * are negative.
 *
 * @param {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @returns {CalculatorState} The next state, or the same one during an error.
 */
export const toggleSign = (state = INITIAL_STATE) => {
    if (state.hasError) {
        return state;
    }

    if (state.entry === EMPTY_ENTRY) {
        return { ...state, entry: NEGATIVE_ZERO_ENTRY };
    }

    const isNegative = state.entry.startsWith(MINUS_SIGN);
    return { ...state, entry: isNegative ? state.entry.slice(MINUS_SIGN.length) : MINUS_SIGN + state.entry };
};

/**
 * Presses `%`: divides the entry by {@link PERCENT_DIVISOR}. The next digit then starts a new entry.
 *
 * @param {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @returns {CalculatorState} The next state, or the same one with no entry or during an error.
 */
export const applyPercent = (state = INITIAL_STATE) => {
    const canApplyPercent = !state.hasError && state.entry !== EMPTY_ENTRY;

    if (!canApplyPercent) {
        return state;
    }

    return {
        ...state,
        entry: formatNumber(parseEntry(state.entry) / PERCENT_DIVISOR),
        justEvaluated: true
    };
};

/**
 * Presses `C`: clears the entry and keeps the running total and the pending operator, so
 * `2 + 3 C 4 =` gives `6`. During an error, it resets everything.
 *
 * @param {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @returns {CalculatorState} The next state.
 */
export const clearEntry = (state = INITIAL_STATE) => {
    if (state.hasError) {
        return INITIAL_STATE;
    }

    return { ...state, entry: EMPTY_ENTRY, justEvaluated: false };
};

/**
 * Presses `AC`: resets everything.
 *
 * @returns {CalculatorState} The initial state.
 */
export const clearAll = () => INITIAL_STATE;

/**
 * Gives the text of the screen: the error message, else the entry as typed, else the running total.
 *
 * @param {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @returns {string} The text to show, `'0'` when there is nothing else to show.
 */
export const getDisplayValue = (state = INITIAL_STATE) => {
    if (state.hasError) {
        return ERROR_MESSAGE;
    }

    if (state.entry !== EMPTY_ENTRY) {
        return state.entry;
    }

    return state.accumulator === null ? ZERO_ENTRY : formatNumber(state.accumulator);
};

/**
 * Tells whether `C` has something to clear: an entry or an error. When it has not, the clear key
 * becomes `AC` and resets everything.
 *
 * @param {CalculatorState} [state] - Current state. Defaults to the initial state.
 * @returns {boolean} Whether the entry or an error can be cleared.
 */
export const canClearEntry = (state = INITIAL_STATE) => state.hasError || state.entry !== EMPTY_ENTRY;
