import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import App from './App';
import { setupStore } from './store';

// The keys and the screen have no accessible role yet, so the queries target their classes.
const KEY_SELECTOR = '.btn';
const SCREEN_SELECTOR = '.result';

const KEY_LABELS = [
  'AC', '+/-', '%',
  '9', '8', '7', '6', '5', '4', '3', '2', '1', '.', '0',
  '/', 'X', '—', '+', '='
];

const renderApp = () => render(
  <Provider store={setupStore()}>
    <App />
  </Provider>
);

const getKey = label => screen.getByText(label, { selector: KEY_SELECTOR });

describe('App', () => {
  it('renders the screen showing 0', () => {
    renderApp();

    expect(screen.getByText('0', { selector: SCREEN_SELECTOR })).toBeInTheDocument();
  });

  it.each(KEY_LABELS)('renders the %s key of the keypad', label => {
    renderApp();

    expect(getKey(label)).toBeInTheDocument();
  });

  it('shows the pressed digits on the screen', () => {
    renderApp();

    // fireEvent rather than user-event 13: that one loads another copy of @testing-library/dom,
    // whose events React Testing Library does not wrap in act(), so the screen would not update.
    fireEvent.click(getKey('7'));
    fireEvent.click(getKey('3'));

    expect(screen.getByText('73', { selector: SCREEN_SELECTOR })).toBeInTheDocument();
  });

  it('turns AC into C after a digit, and C brings the screen back to 0', () => {
    renderApp();

    fireEvent.click(getKey('7'));
    fireEvent.click(getKey('C'));

    expect(screen.getByText('0', { selector: SCREEN_SELECTOR })).toBeInTheDocument();
    expect(getKey('AC')).toBeInTheDocument();
  });

  // Labels of the keys to click, separated by spaces: `X` multiplies and `—` subtracts.
  it.each([
    ['5 =', '5'],
    ['2 + 3 + 4 =', '9'],
    ['2 + 3 X 4 =', '20'],
    ['2 + 3 +', '5'],
    ['0 — 5 — 1 =', '-6'],
    ['5 X 0 + 2 =', '2'],
    // After `=` the clear key reads C, and AC once the result is cleared.
    ['9 — 3 = C AC 5 =', '5'],
    ['2 + 3 = 7 + 1 =', '8'],
    ['2 + 3 = 4 =', '4'],
    ['1 . 0 5', '1.05'],
    ['0 . 0 5', '0.05'],
    ['1 . 2 . 3', '1.23'],
    ['5 + 1 . =', '6'],
    ['6 / 0 =', 'Erreur'],
    ['0 . 1 + 0 . 2 =', '0.3'],
    ['+/- 5', '-5'],
    ['2 + 3 C 4 =', '6'],
    ['5 0 %', '0.5']
  ])('shows %j as %j on the screen', (sequence, expected) => {
    renderApp();

    sequence.split(' ').forEach(label => fireEvent.click(getKey(label)));

    expect(screen.getByText(expected, { selector: SCREEN_SELECTOR })).toBeInTheDocument();
  });
});
