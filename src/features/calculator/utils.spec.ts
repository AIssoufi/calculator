import type { Operator } from './types';
import { applyOperator, countDigits, formatNumber, isDigit, isOperator, parseEntry } from './utils';

describe('isDigit', () => {
  it.each(['0', '5', '9'])('accepts the digit %j', key => {
    expect(isDigit(key)).toBe(true);
  });

  it.each(['', '.', '-', '12', 'a', ' 1', 5, null, undefined])('rejects %j', key => {
    expect(isDigit(key)).toBe(false);
  });
});

describe('isOperator', () => {
  it.each(['+', '-', '*', '/'])('accepts the operator %j', key => {
    expect(isOperator(key)).toBe(true);
  });

  it.each(['', 'x', 'X', '=', '%', 'toString', null, undefined])('rejects %j', key => {
    expect(isOperator(key)).toBe(false);
  });
});

describe('countDigits', () => {
  it.each([
    ['', 0],
    ['0', 1],
    ['-0', 1],
    ['0.', 1],
    ['-1.05', 3],
    ['123456789', 9]
  ])('counts the digits of %j', (entry, expected) => {
    expect(countDigits(entry)).toBe(expected);
  });
});

describe('parseEntry', () => {
  it.each([
    ['7', 7],
    ['-7', -7],
    ['1.05', 1.05],
    ['0.', 0],
    ['-1.', -1],
    ['1e-7', 1e-7],
    ['1e+21', 1e21]
  ])('reads %j as %p', (entry, expected) => {
    expect(parseEntry(entry)).toBe(expected);
  });

  it.each(['', '-', '.', 'abc', undefined])('reads %j, which holds no number, as 0', entry => {
    // @ts-expect-error -- an entry of another type can still reach the helper at run time
    expect(parseEntry(entry)).toBe(0);
  });
});

describe('formatNumber', () => {
  it.each([
    [0, '0'],
    [-0, '0'],
    [5, '5'],
    [-6, '-6'],
    [1.05, '1.05'],
    [0.1 + 0.2, '0.3'],
    [2 / 3, '0.666666666667'],
    [1e21, '1e+21'],
    [1e-7, '1e-7'],
    [99999999999, '99999999999'],
    [100000000000, '100000000000'],
    [-100000000001, '-100000000001'],
    [999999999999, '999999999999'],
    [1000000000000, '1000000000000'],
    [999999999 * 9999, '9998999990001'],
    [Number.MAX_SAFE_INTEGER, '9007199254740991'],
    [-Number.MAX_SAFE_INTEGER, '-9007199254740991'],
    [2 ** 53, '9.00719925474e+15'],
    [-(2 ** 53), '-9.00719925474e+15'],
    [123456789 * 987654321, '1.21932631113e+17'],
    [1234567890123.5, '1.23456789012e+12'],
    [999999999999.5, '1e+12'],
    [123456789012.5, '1.23456789013e+11'],
    [-123456789012.5, '-1.23456789013e+11'],
    [999999999000.5, '9.99999999001e+11'],
    [123456789012.25, '1.23456789012e+11'],
    [100000000000.5, '1.00000000001e+11'],
    [99999999999.5, '99999999999.5'],
    [99999999999.99, '1e+11'],
    [123456789.1234, '123456789.123']
  ])('formats %p as %j', (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });

  it.each([Infinity, -Infinity, NaN, '5', null, undefined])(
    'formats %p, which is not a finite number, as "0"',
    value => {
      // @ts-expect-error -- a value of another type can still reach the helper at run time
      expect(formatNumber(value)).toBe('0');
    }
  );
});

describe('applyOperator', () => {
  it.each<[number, Operator, number, number]>([
    [2, '+', 3, 5],
    [2, '-', 3, -1],
    [2, '*', 3, 6],
    [6, '/', 3, 2],
    [0, '-', 5, -5],
    [5, '*', 0, 0]
  ])('computes %p %s %p as %p', (left, operator, right, expected) => {
    expect(applyOperator({ left, operator, right })).toBe(expected);
  });

  it('gives Infinity for a division by zero, for the caller to report', () => {
    expect(applyOperator({ left: 6, operator: '/', right: 0 })).toBe(Infinity);
  });

  it('gives NaN for zero divided by zero, for the caller to report', () => {
    expect(applyOperator({ left: 0, operator: '/', right: 0 })).toBeNaN();
  });

  it.each(['x', '', 'toString', undefined])(
    'returns the right operand for the unknown operator %j',
    operator => {
      // @ts-expect-error -- an unknown operator can still reach the helper at run time
      expect(applyOperator({ left: 2, operator, right: 3 })).toBe(3);
    }
  );
});
