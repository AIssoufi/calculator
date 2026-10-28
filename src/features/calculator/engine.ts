import {
  DECIMAL_POINT,
  EMPTY_ENTRY,
  ERROR_MESSAGE,
  INITIAL_STATE,
  MAX_ENTRY_DIGITS,
  MINUS_SIGN,
  PERCENT_DIVISOR,
  SHARE_OF_TOTAL_OPERATORS,
  ZERO_ENTRY
} from './constants';
import type { CalculatorState, Digit, Operator, RepeatableOperation } from './types';
import { applyOperator, countDigits, formatNumber, isDigit, isOperator, parseEntry } from './utils';

/** Parameters of {@link inputDigit}. */
interface InputDigitParams {
  /** Current state. Defaults to the initial state. */
  state?: CalculatorState;
  /** Digit pressed, from `'0'` to `'9'`; any other value is ignored. */
  digit?: string;
}

/** Parameters of {@link chooseOperator}. */
interface ChooseOperatorParams {
  /** Current state. Defaults to the initial state. */
  state?: CalculatorState;
  /** Operator pressed; any other value is ignored. */
  operator?: Operator;
}

/** Parameters of {@link appendDigit}. */
interface AppendDigitParams {
  /** Entry the digit is typed into. */
  entry: string;
  /** Digit added at the end of the entry, replacing a lone `0` or `-0`. */
  digit: Digit;
}

/** Parameters of {@link applyOperation}. */
interface ApplyOperationParams {
  /** Left operand: the running total, or the result a repeated `=` starts from. */
  left: number;
  /** Operator and right operand to apply, kept for a repeated `=`. */
  operation: RepeatableOperation;
}

const ERROR_STATE: Readonly<CalculatorState> = Object.freeze({ ...INITIAL_STATE, hasError: true });

const NEGATIVE_ZERO_ENTRY = MINUS_SIGN + ZERO_ENTRY;

/**
 * Gives the state a typed character starts from: an error or a computed entry is dropped first, with
 * the operation a repeated `=` would apply.
 */
const getEditableState = (state: CalculatorState): CalculatorState => {
  if (state.hasError) {
    return INITIAL_STATE;
  }

  if (state.justEvaluated) {
    return {
      ...state,
      entry: EMPTY_ENTRY,
      result: null,
      justEvaluated: false,
      lastOperation: null
    };
  }

  return state;
};

/** Reads the value of the entry: the unrounded result of a computed entry, else the typed number. */
const readEntry = (state: CalculatorState): number => state.result ?? parseEntry(state.entry);

/** Appends a digit to an entry, replacing a lone leading zero so `0` then `7` gives `7`, not `07`. */
const appendDigit = ({ entry, digit }: AppendDigitParams): string => {
  const isZeroEntry = entry === ZERO_ENTRY || entry === NEGATIVE_ZERO_ENTRY;
  return isZeroEntry ? entry.slice(0, -ZERO_ENTRY.length) + digit : entry + digit;
};

/** Gives the state holding a result as its entry, or the error state when the result is not finite. */
const toResultState = (result: number): CalculatorState => {
  if (!Number.isFinite(result)) {
    return ERROR_STATE;
  }

  return { ...INITIAL_STATE, entry: formatNumber(result), result, justEvaluated: true };
};

/** Applies an operation and gives its result state, which keeps the operation for a repeated `=`. */
const applyOperation = ({ left, operation }: ApplyOperationParams): CalculatorState => {
  const { operator, operand } = operation;
  const resultState = toResultState(applyOperator({ left, operator, right: operand }));
  return resultState.hasError ? resultState : { ...resultState, lastOperation: operation };
};

/**
 * Computes the value of `%`: after a pending `+` or `-`, a share of the running total, so
 * `200 + 10 %` gives `20`; otherwise the entry divided by {@link PERCENT_DIVISOR}.
 */
const computePercent = (state: CalculatorState): number => {
  const { accumulator, pendingOperator } = state;
  const fraction = readEntry(state) / PERCENT_DIVISOR;
  const isShareOfTotal =
    accumulator !== null &&
    pendingOperator !== null &&
    SHARE_OF_TOTAL_OPERATORS.includes(pendingOperator);

  return isShareOfTotal ? accumulator * fraction : fraction;
};

/**
 * Types a digit at the end of the entry.
 * After `=` or `%` it starts a new entry, and after an error it starts a new calculation.
 * A digit beyond {@link MAX_ENTRY_DIGITS} is ignored.
 *
 * @returns The next state, or the same one for an invalid digit.
 */
export const inputDigit = ({
  state = INITIAL_STATE,
  digit
}: InputDigitParams = {}): CalculatorState => {
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
 * @param state - Current state. Defaults to the initial state.
 * @returns The next state.
 */
export const inputDecimalPoint = (state: CalculatorState = INITIAL_STATE): CalculatorState => {
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
 * @returns The next state, the error state when the total is not finite, or the
 * same state for an invalid operator or during an error.
 */
export const chooseOperator = ({
  state = INITIAL_STATE,
  operator
}: ChooseOperatorParams = {}): CalculatorState => {
  if (state.hasError || !isOperator(operator)) {
    return state;
  }

  if (state.entry === EMPTY_ENTRY) {
    return { ...state, accumulator: state.accumulator ?? 0, pendingOperator: operator };
  }

  const operand = readEntry(state);
  const total =
    state.pendingOperator === null
      ? operand
      : applyOperator({
          left: state.accumulator ?? 0,
          operator: state.pendingOperator,
          right: operand
        });

  if (!Number.isFinite(total)) {
    return ERROR_STATE;
  }

  return { ...INITIAL_STATE, accumulator: total, pendingOperator: operator };
};

/**
 * Presses `=`: applies the pending operator and shows the result, which the next operator continues
 * from. Pressed again right after, it applies the same operator and operand to the result, so
 * `2 + 3 = =` gives `8`. With no operand after the operator, or no operator at all, the shown value
 * becomes the result.
 *
 * @param state - Current state. Defaults to the initial state.
 * @returns The next state, the error state when the result is not finite, or the
 * same state when there is nothing to evaluate.
 */
export const evaluate = (state: CalculatorState = INITIAL_STATE): CalculatorState => {
  const hasEntry = state.entry !== EMPTY_ENTRY;
  const shownValue = hasEntry ? readEntry(state) : state.accumulator;
  const canEvaluate = !state.hasError && shownValue !== null;

  if (!canEvaluate) {
    return state;
  }

  const { pendingOperator, lastOperation } = state;
  const isOperationComplete = hasEntry && pendingOperator !== null;

  if (isOperationComplete) {
    return applyOperation({
      left: state.accumulator ?? 0,
      operation: { operator: pendingOperator, operand: readEntry(state) }
    });
  }

  const canRepeatLastOperation = state.justEvaluated && lastOperation !== null;

  if (canRepeatLastOperation) {
    return applyOperation({ left: shownValue, operation: lastOperation });
  }

  return toResultState(shownValue);
};

/**
 * Presses `±`: flips the sign of the entry. An empty entry becomes `-0`, so the digits typed next
 * are negative.
 *
 * @param state - Current state. Defaults to the initial state.
 * @returns The next state, or the same one during an error.
 */
export const toggleSign = (state: CalculatorState = INITIAL_STATE): CalculatorState => {
  if (state.hasError) {
    return state;
  }

  if (state.entry === EMPTY_ENTRY) {
    return { ...state, entry: NEGATIVE_ZERO_ENTRY };
  }

  const isNegative = state.entry.startsWith(MINUS_SIGN);
  return {
    ...state,
    entry: isNegative ? state.entry.slice(MINUS_SIGN.length) : MINUS_SIGN + state.entry,
    result: state.result === null ? null : -state.result
  };
};

/**
 * Presses `%`: after a pending `+` or `-`, turns the entry into that share of the running total, so
 * `200 + 10 % =` gives `220`; otherwise divides the entry by {@link PERCENT_DIVISOR}, so
 * `50 * 10 % =` gives `5`. The next digit then starts a new entry.
 *
 * @param state - Current state. Defaults to the initial state.
 * @returns The next state, or the same one with no entry or during an error.
 */
export const applyPercent = (state: CalculatorState = INITIAL_STATE): CalculatorState => {
  const canApplyPercent = !state.hasError && state.entry !== EMPTY_ENTRY;

  if (!canApplyPercent) {
    return state;
  }

  const result = computePercent(state);
  return { ...state, entry: formatNumber(result), result, justEvaluated: true };
};

/**
 * Presses `C`: clears the entry and keeps the running total and the pending operator, so
 * `2 + 3 C 4 =` gives `6`. During an error, it resets everything.
 *
 * @param state - Current state. Defaults to the initial state.
 * @returns The next state.
 */
export const clearEntry = (state: CalculatorState = INITIAL_STATE): CalculatorState => {
  if (state.hasError) {
    return INITIAL_STATE;
  }

  return { ...state, entry: EMPTY_ENTRY, result: null, justEvaluated: false, lastOperation: null };
};

/**
 * Presses `AC`: resets everything.
 *
 * @returns The initial state.
 */
export const clearAll = (): CalculatorState => INITIAL_STATE;

/**
 * Gives the text of the screen: the error message, else the entry as typed, else the running total.
 *
 * @param state - Current state. Defaults to the initial state.
 * @returns The text to show, `'0'` when there is nothing else to show.
 */
export const getDisplayValue = (state: CalculatorState = INITIAL_STATE): string => {
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
 * @param state - Current state. Defaults to the initial state.
 * @returns Whether the entry or an error can be cleared.
 */
export const canClearEntry = (state: CalculatorState = INITIAL_STATE): boolean =>
  state.hasError || state.entry !== EMPTY_ENTRY;
