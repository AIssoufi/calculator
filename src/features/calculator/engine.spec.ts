import { ERROR_MESSAGE, INITIAL_STATE } from './constants';
import {
  applyPercent,
  canClearEntry,
  chooseOperator,
  clearAll,
  clearEntry,
  evaluate,
  getDisplayValue,
  inputDecimalPoint,
  inputDigit,
  toggleSign
} from './engine';
import type { CalculatorState } from './types';
import { isOperator } from './utils';

type KeyHandler = (state: CalculatorState) => CalculatorState;

/** Engine function of each key, as the tables below write the keys. */
const KEY_HANDLERS: Record<string, KeyHandler> = {
  '.': inputDecimalPoint,
  '=': evaluate,
  '±': toggleSign,
  '%': applyPercent,
  C: clearEntry,
  AC: clearAll
};

/** Presses each key of a space-separated sequence, from the initial state. */
const pressKeys = (sequence: string) =>
  sequence.split(' ').reduce<CalculatorState>((state, key) => {
    if (KEY_HANDLERS[key]) {
      return KEY_HANDLERS[key](state);
    }

    if (isOperator(key)) {
      return chooseOperator({ state, operator: key });
    }

    return inputDigit({ state, digit: key });
  }, INITIAL_STATE);

const display = (sequence: string) => getDisplayValue(pressKeys(sequence));

describe('engine', () => {
  describe('sequences of the bug report', () => {
    it.each([
      ['5 =', '5'],
      ['2 + 3 + 4 =', '9'],
      ['2 + 3 * 4 =', '20'],
      ['2 + 3 +', '5'],
      ['0 - 5 - 1 =', '-6'],
      ['5 * 0 + 2 =', '2'],
      ['9 - 3 = AC 5 =', '5'],
      ['2 + 3 = 7 + 1 =', '8'],
      ['2 + 3 = 4 =', '4'],
      ['1 . 0 5', '1.05'],
      ['0 . 0 5', '0.05'],
      ['1 . 2 . 3', '1.23'],
      ['5 + 1 . =', '6'],
      ['6 / 0 =', ERROR_MESSAGE],
      ['0 . 1 + 0 . 2 =', '0.3'],
      ['± 5', '-5'],
      ['2 + 3 C 4 =', '6']
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });
  });

  describe('digits', () => {
    it.each([
      ['0', '0'],
      ['0 0 7', '7'],
      ['7 0', '70'],
      ['1 2 3 4 5 6 7 8 9', '123456789'],
      ['1 2 3 4 5 6 7 8 9 1', '123456789'],
      ['. 1 2 3 4 5 6 7 8 9 1', '0.12345678'],
      ['± 0 0', '-0'],
      ['3 = 4', '4'],
      ['5 % 3', '3'],
      ['6 / 0 = 7', '7']
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });

    it.each(['', '.', '12', 'x', 5, null, undefined])('ignores the invalid digit %j', digit => {
      const state = pressKeys('4');

      // @ts-expect-error -- a digit of another type can still reach the engine at run time
      expect(inputDigit({ state, digit })).toBe(state);
    });

    it('starts from the initial state when none is given', () => {
      expect(getDisplayValue(inputDigit({ digit: '8' }))).toBe('8');
    });

    it('returns the initial state when called with no parameters', () => {
      expect(inputDigit()).toBe(INITIAL_STATE);
    });
  });

  describe('decimal point', () => {
    it.each([
      ['.', '0.'],
      ['. 5', '0.5'],
      ['± .', '-0.'],
      ['1 .', '1.'],
      ['1 . 0', '1.0'],
      ['1 . .', '1.'],
      ['2 + 3 = .', '0.'],
      ['6 / 0 = .', '0.'],
      ['5 % .', '0.']
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });

    it('starts from the initial state when none is given', () => {
      expect(getDisplayValue(inputDecimalPoint())).toBe('0.');
    });
  });

  describe('operators', () => {
    it.each([
      ['+', '0'],
      ['+ 5 =', '5'],
      ['- 5 =', '-5'],
      ['2 +', '2'],
      ['2 + * 3 =', '6'],
      ['2 * + 3 =', '5'],
      ['8 / 2 * 3 =', '12'],
      ['2 + 3 = + 1 =', '6'],
      ['2 + 3 = * =', '5'],
      ['1 . + 1 =', '2'],
      ['6 / 0 +', ERROR_MESSAGE],
      ['6 / 0 = + 1 =', '1'],
      ['9 9 9 9 9 9 9 9 9 * 9 9 9 9 =', '9998999990001'],
      ['1 2 3 4 5 6 7 8 9 * 1 2 3 4 5 6 7 8 9 =', '1.52415787502e+16'],
      ['9 9 9 9 9 9 9 9 9 * 9 9 9 9 9 9 9 9 9 =', '9.99999998e+17'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 =', '1.23449999877e+12'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = +', '1.23449999877e+12'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = + 0 . 5 =', '1234499998766'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = =', '1.52399024848e+15'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = = / 1 2 3 4 . 5 =', '1.23449999877e+12'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = ± + 0 . 5 =', '-1234499998765'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = ± ± + 0 . 5 =', '1234499998766'],
      ['0 = ± + 5 =', '5'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = % %', '123449999.877'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = C 5 +', '5'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = 5 +', '5'],
      ['9 9 9 9 9 9 9 9 9 * 1 2 3 4 . 5 = . 5 +', '0.5']
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });

    it.each(['', 'x', '=', 'toString', null, undefined])(
      'ignores the invalid operator %j',
      operator => {
        const state = pressKeys('4');

        // @ts-expect-error -- an unknown operator can still reach the engine at run time
        expect(chooseOperator({ state, operator })).toBe(state);
      }
    );

    it('starts from the initial state when none is given', () => {
      expect(chooseOperator({ operator: '+' })).toEqual({
        ...INITIAL_STATE,
        accumulator: 0,
        pendingOperator: '+'
      });
    });

    it('returns the initial state when called with no parameters', () => {
      expect(chooseOperator()).toBe(INITIAL_STATE);
    });
  });

  describe('equals', () => {
    it.each([
      ['=', '0'],
      ['= =', '0'],
      ['2 + =', '2'],
      ['2 + 3 = =', '8'],
      ['2 + 3 = = =', '11'],
      ['1 0 - 4 = =', '2'],
      ['2 * 3 = =', '18'],
      ['8 1 / 3 = =', '9'],
      ['2 + 3 = ± =', '-2'],
      ['2 + 3 = + =', '5'],
      ['2 + 3 = 4 =', '4'],
      ['2 + 3 = C 4 =', '4'],
      ['2 + 3 = AC =', '0'],
      ['0 . 1 + 0 . 2 = = =', '0.7'],
      ['5 = =', '5'],
      ['1 . =', '1'],
      ['0 / 0 =', ERROR_MESSAGE],
      ['6 / 0 = =', ERROR_MESSAGE]
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });

    it('shows an error once a repeated = overflows', () => {
      expect(display(`9 9 9 9 9 9 9 9 9 * 9 9 9 9 9 9 9 9 9${' ='.repeat(40)}`)).toBe(
        ERROR_MESSAGE
      );
    });

    it('leaves the initial state unchanged', () => {
      expect(evaluate()).toBe(INITIAL_STATE);
    });
  });

  describe('sign', () => {
    it.each([
      ['±', '-0'],
      ['± ±', '0'],
      ['5 ±', '-5'],
      ['5 ± ±', '5'],
      ['2 + 3 = ±', '-5'],
      ['2 + 3 = ± 4', '4'],
      ['2 - ± 3 =', '5'],
      ['6 / 0 = ±', ERROR_MESSAGE]
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });

    it('starts from the initial state when none is given', () => {
      expect(getDisplayValue(toggleSign())).toBe('-0');
    });
  });

  describe('percent', () => {
    it.each([
      ['%', '0'],
      ['5 %', '0.05'],
      ['5 0 % %', '0.005'],
      ['2 0 0 + 1 0 %', '20'],
      ['2 0 0 + 1 0 % =', '220'],
      ['1 0 0 - 2 0 % =', '80'],
      ['2 0 0 + 1 0 % %', '40'],
      ['2 0 0 + 1 0 % = =', '240'],
      ['2 0 0 + ± 1 0 % =', '180'],
      ['5 0 * 1 0 % =', '5'],
      ['5 0 / 1 0 % =', '500'],
      ['2 0 0 + 1 0 % 5 =', '205'],
      ['2 0 0 + 1 0 % + 5 =', '225'],
      ['2 + 5 0 % =', '3'],
      ['2 + 3 = %', '0.05'],
      ['2 + 3 = % =', '3.05'],
      ['. 0 0 0 0 1 % %', '1e-9'],
      ['. 0 0 0 0 1 % % ±', '-1e-9'],
      ['6 / 0 = %', ERROR_MESSAGE]
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });

    it('leaves the initial state unchanged', () => {
      expect(applyPercent()).toBe(INITIAL_STATE);
    });
  });

  describe('clear', () => {
    it.each([
      ['C', '0'],
      ['7 C', '0'],
      ['2 + 3 C', '2'],
      ['2 + 3 = C', '0'],
      ['6 / 0 = C', '0'],
      ['6 / 0 = C 1 + 1 =', '2'],
      ['2 + 3 AC', '0'],
      ['2 + AC 3 =', '3']
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });

    it('resets everything on AC', () => {
      expect(clearAll()).toBe(INITIAL_STATE);
    });

    it('resets the error state on C', () => {
      expect(clearEntry(pressKeys('6 / 0 ='))).toBe(INITIAL_STATE);
    });

    it('starts from the initial state when none is given', () => {
      expect(clearEntry()).toEqual(INITIAL_STATE);
    });
  });

  describe('getDisplayValue', () => {
    it('shows 0 for the initial state', () => {
      expect(getDisplayValue()).toBe('0');
    });

    it('rounds the running total', () => {
      expect(display('0 . 1 + 0 . 2 +')).toBe('0.3');
    });
  });

  describe('a sum or a difference where close values cancel out', () => {
    it.each([
      ['0 . 1 + 0 . 2 - 0 . 3 =', '0'],
      ['1 . 1 + 2 . 2 - 3 . 3 =', '0'],
      ['0 . 3 - 0 . 1 - 0 . 2 =', '0'],
      ['0 . 1 * 3 - 0 . 3 =', '0'],
      ['1 . 0 0 0 0 0 0 1 - 1 =', '1e-7'],
      ['0 . 1 ± - 0 . 2 ± + 0 . 3 =', '0.4'],
      ['0 . 1 + 0 . 2 - 0 . 3 +', '0'],
      ['0 . 1 + 0 . 2 - 0 . 3 + 5 =', '5'],
      ['0 . 1 + 0 . 2 - 0 . 3 = =', '-0.3'],
      ['0 . 3 - 0 . 1 = =', '0.1'],
      ['0 . 3 - 0 . 1 = = =', '0'],
      ['0 + 0 =', '0'],
      ['0 - 0 =', '0'],
      ['9 9 9 9 9 9 9 9 9 * 9 9 9 9 9 9 9 9 9 - 1 =', '9.99999998e+17'],
      ['1 2 3 4 5 6 7 8 9 * 1 0 0 0 0 0 0 + 1 =', '123456789000001']
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });

    it('still shows an error once a sum overflows', () => {
      // About 1.35e308, which `+ 100 %` adds to itself, beyond the largest finite number.
      const nearMaximum = `9${' * 9 9 9 9 9 9 9 9 9'.repeat(34)} * 1 5`;

      expect(display(`${nearMaximum} +`)).not.toBe(ERROR_MESSAGE);
      expect(display(`${nearMaximum} + 1 0 0 % =`)).toBe(ERROR_MESSAGE);
    });
  });

  describe('a result whose integer part fills the display precision', () => {
    it.each([
      ['1 2 3 4 5 6 7 8 9 * 1 0 0 0 + 1 2 . 5 =', '1.23456789013e+11'],
      ['9 9 9 9 9 9 9 9 9 * 1 0 0 0 + 0 . 5 =', '9.99999999001e+11'],
      ['1 2 3 4 5 6 7 8 9 * 1 0 0 0 + 1 2 =', '123456789012'],
      ['9 9 9 9 9 9 9 9 9 * 1 0 0 + 9 9 . 5 =', '99999999999.5'],
      ['1 0 0 0 0 0 * 1 0 0 0 0 0 0 + 0 . 0 0 0 0 1 =', '1e+11'],
      ['1 2 3 4 5 6 7 8 9 * 1 0 0 0 0 0 0 + 0 . 4 =', '1.23456789e+14']
    ])('shows %j as %j', (sequence, expected) => {
      expect(display(sequence)).toBe(expected);
    });
  });

  describe('canClearEntry', () => {
    it.each([
      ['', false],
      ['7', true],
      ['2 +', false],
      ['2 + 3', true],
      ['2 + 3 =', true],
      ['2 + 3 C', false],
      ['6 / 0 =', true]
    ])('after %j is %s', (sequence, expected) => {
      const state = sequence ? pressKeys(sequence) : INITIAL_STATE;

      expect(canClearEntry(state)).toBe(expected);
    });

    it('is false for the initial state when none is given', () => {
      expect(canClearEntry()).toBe(false);
    });
  });

  describe('a malformed state with an operator but no running total', () => {
    const state: CalculatorState = { ...INITIAL_STATE, pendingOperator: '-', entry: '3' };

    it('takes 0 as the running total on an operator', () => {
      expect(getDisplayValue(chooseOperator({ state, operator: '+' }))).toBe('-3');
    });

    it('takes 0 as the running total on equals', () => {
      expect(getDisplayValue(evaluate(state))).toBe('-3');
    });
  });

  it('never mutates the state it receives', () => {
    const state = Object.freeze(pressKeys('2 + 3'));
    const handlers: KeyHandler[] = [
      ...Object.values(KEY_HANDLERS),
      frozenState => inputDigit({ state: frozenState, digit: '4' }),
      frozenState => chooseOperator({ state: frozenState, operator: '*' })
    ];

    // A write to a frozen object throws in the strict mode of ES modules.
    handlers.forEach(handler => handler(state));

    expect(state).toEqual({ ...INITIAL_STATE, accumulator: 2, pendingOperator: '+', entry: '3' });
  });
});
