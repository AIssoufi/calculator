import type { OPERATORS } from './constants';

/** One of the four {@link OPERATORS}, by its symbol: `'+'`, `'-'`, `'*'` or `'/'`. */
export type Operator = (typeof OPERATORS)[keyof typeof OPERATORS];

/** A single digit key, from `'0'` to `'9'`. */
export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** An operator with its right operand, which a repeated `=` applies again to the result. */
export interface RepeatableOperation {
  /** Operator of the last operation `=` completed. */
  operator: Operator;
  /** Right operand of that operation. */
  operand: number;
}

/**
 * State of a pocket calculator that evaluates from left to right: `2 + 3 × 4 =` gives `20`.
 * The engine is framework-free: each key press is a pure function from a state to the next one.
 */
export interface CalculatorState {
  /** Running total, the left operand of the next operator; `null` until an operator is pressed. */
  accumulator: number | null;
  /** Operator waiting for its right operand, or `null`. */
  pendingOperator: Operator | null;
  /**
   * Number being typed, kept as text so `0.` and `1.0` show as typed; `''` when nothing has been
   * typed since the last operator.
   */
  entry: string;
  /**
   * Unrounded value of a computed entry, after `=` or `%`, which the next operation reads instead of
   * the rounded text of the entry; `null` for a typed or empty entry.
   */
  result: number | null;
  /**
   * Whether the entry holds a computed value, after `=` or `%`: the next digit or decimal point
   * replaces it instead of extending it.
   */
  justEvaluated: boolean;
  /**
   * Last operation `=` completed, which a repeated `=` applies again: `2 + 3 = =` gives `8`;
   * `null` once anything but `=`, `%` or `±` is pressed.
   */
  lastOperation: RepeatableOperation | null;
  /**
   * Whether the last operation gave no finite result; only a digit, a decimal point, `C` or `AC`
   * leave this state.
   */
  hasError: boolean;
}
