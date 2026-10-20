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
});
