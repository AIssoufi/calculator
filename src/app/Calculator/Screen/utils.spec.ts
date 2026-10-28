import { MIN_TEXT_LENGTH, TEXT_LENGTH_PROPERTY } from './constants';
import { getTextLengthStyle } from './utils';

describe('getTextLengthStyle', () => {
  it.each([
    ['0', 1],
    ['-12.5', 5],
    ['999998999000000', 15],
    ['-1.23456789012e-21', 18],
    ['Erreur', 6]
  ])('gives %j a length of %i', (text, expected) => {
    expect(getTextLengthStyle(text)).toEqual({ [TEXT_LENGTH_PROPERTY]: expected });
  });

  it.each([
    ['an empty text', ''],
    ['undefined', undefined],
    ['null', null],
    ['a number', 12345],
    ['an object', { length: 40 }]
  ])('gives %s the minimum length', (_label, text) => {
    expect(getTextLengthStyle(text)).toEqual({ [TEXT_LENGTH_PROPERTY]: MIN_TEXT_LENGTH });
  });
});
