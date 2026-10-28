import type { AnyAction } from '@reduxjs/toolkit';

import calculatorReducer, {
  calculatorSlice,
  pressAllClear,
  pressClearEntry,
  pressDecimalPoint,
  pressDigit,
  pressEquals,
  pressOperator,
  pressPercent,
  pressToggleSign,
  selectCanClearEntry,
  selectDisplayValue
} from './calculatorSlice';
import { ERROR_MESSAGE, INITIAL_STATE, OPERATORS } from './constants';

const reduce = (actions: AnyAction[]) => ({
  calculator: actions.reduce(calculatorReducer, calculatorSlice.getInitialState())
});

describe('calculatorSlice', () => {
  it('starts with the initial state of the engine', () => {
    expect(calculatorSlice.getInitialState()).toEqual(INITIAL_STATE);
  });

  it.each([
    [
      [
        pressDigit('2'),
        pressOperator(OPERATORS.ADD),
        pressDigit('3'),
        pressOperator(OPERATORS.MULTIPLY),
        pressDigit('4'),
        pressEquals()
      ],
      '20'
    ],
    [[pressDigit('1'), pressDecimalPoint(), pressDigit('5'), pressPercent()], '0.015'],
    [[pressToggleSign(), pressDigit('5')], '-5'],
    [
      [pressDigit('6'), pressOperator(OPERATORS.DIVIDE), pressDigit('0'), pressEquals()],
      ERROR_MESSAGE
    ],
    [[pressDigit('2'), pressOperator(OPERATORS.ADD), pressDigit('3'), pressClearEntry()], '2'],
    [[pressDigit('2'), pressOperator(OPERATORS.ADD), pressDigit('3'), pressAllClear()], '0']
  ])('hands the key presses to the engine (case %#)', (actions, expected) => {
    expect(selectDisplayValue(reduce(actions))).toBe(expected);
  });

  it.each([
    [[], false],
    [[pressDigit('7')], true],
    [[pressDigit('7'), pressClearEntry()], false]
  ])('selects whether the entry can be cleared (case %#)', (actions, expected) => {
    expect(selectCanClearEntry(reduce(actions))).toBe(expected);
  });

  it.each([
    pressDigit('x'),
    // @ts-expect-error -- an action with no digit can still be dispatched at run time
    pressDigit(),
    // @ts-expect-error -- `=` is not an operator: it has its own action, `pressEquals`
    pressOperator('='),
    // @ts-expect-error -- an action with no operator can still be dispatched at run time
    pressOperator()
  ])('ignores the invalid key press %j', action => {
    expect(calculatorReducer(INITIAL_STATE, action)).toBe(INITIAL_STATE);
  });
});
