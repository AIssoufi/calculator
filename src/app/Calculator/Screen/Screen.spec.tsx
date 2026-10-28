import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { setupStore } from '../../store';
import {
  pressDigit,
  pressOperator,
  pressEquals
} from '../../../features/calculator/calculatorSlice';
import { OPERATORS } from '../../../features/calculator/constants';
import { TEXT_LENGTH_PROPERTY } from './constants';
import { Screen } from './Screen';

const RESULT_SELECTOR = '.result';
const DECORATIVE_COPY_SELECTOR = '#result';

const renderScreen = () => {
  const store = setupStore();
  render(
    <Provider store={store}>
      <Screen />
    </Provider>
  );
  return store;
};

const getResult = (text: string) => screen.getByText(text, { selector: RESULT_SELECTOR });

const getTextLength = (element: HTMLElement) =>
  element.style.getPropertyValue(TEXT_LENGTH_PROPERTY);

describe('Screen', () => {
  it('announces its text to screen readers as a polite status', () => {
    renderScreen();

    expect(screen.getByRole('status')).toBe(getResult('0'));
  });

  it('hides its large faded copy from screen readers', () => {
    renderScreen();

    const copy = screen.getByText('0', { selector: DECORATIVE_COPY_SELECTOR });

    expect(copy).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows 0 with a text length of 1 before any key press', () => {
    renderScreen();

    expect(getTextLength(getResult('0'))).toBe('1');
  });

  it('gives a 15-digit result its length, so the font shrinks to fit it', () => {
    const store = renderScreen();

    act(() => {
      '999999999'.split('').forEach(digit => store.dispatch(pressDigit(digit)));
      store.dispatch(pressOperator(OPERATORS.MULTIPLY));
      '999999'.split('').forEach(digit => store.dispatch(pressDigit(digit)));
      store.dispatch(pressEquals());
    });

    expect(getTextLength(getResult('999998999000001'))).toBe('15');
  });

  it('gives a result in exponent notation its length, so the font shrinks to fit it', () => {
    const store = renderScreen();

    act(() => {
      '123456789'.split('').forEach(digit => store.dispatch(pressDigit(digit)));
      store.dispatch(pressOperator(OPERATORS.MULTIPLY));
      '123456789'.split('').forEach(digit => store.dispatch(pressDigit(digit)));
      store.dispatch(pressEquals());
    });

    expect(getTextLength(getResult('1.52415787502e+16'))).toBe('17');
  });

  it('gives the error message its length', () => {
    const store = renderScreen();

    act(() => {
      store.dispatch(pressDigit('6'));
      store.dispatch(pressOperator(OPERATORS.DIVIDE));
      store.dispatch(pressDigit('0'));
      store.dispatch(pressEquals());
    });

    expect(getTextLength(getResult('Erreur'))).toBe('6');
  });
});
