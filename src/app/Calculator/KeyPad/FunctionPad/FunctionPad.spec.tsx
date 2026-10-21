import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import { pressDigit } from '../../../../features/calculator/calculatorSlice';
import { setupStore } from '../../../store';
import { ALL_CLEAR_KEY, CLEAR_ENTRY_KEY, TOGGLE_SIGN_NAME } from './constants';
import FunctionPad from './FunctionPad';

const renderFunctionPad = () => {
  const store = setupStore();
  render(
    <Provider store={store}>
      <FunctionPad />
    </Provider>
  );
  return { store, user: userEvent.setup() };
};

describe('FunctionPad', () => {
  it('names the clear key AC and the sign key for screen readers, before any key press', () => {
    renderFunctionPad();

    expect(screen.getByRole('button', { name: ALL_CLEAR_KEY.name }))
      .toHaveTextContent(ALL_CLEAR_KEY.label);
    expect(screen.getByRole('button', { name: TOGGLE_SIGN_NAME })).toHaveTextContent('+/-');
    expect(screen.getByRole('button', { name: '%' })).toBeInTheDocument();
  });

  it.each(['{Escape}', '{Backspace}'])('clears the entry with %s, and the key turns into AC', async key => {
    const { store, user } = renderFunctionPad();
    store.dispatch(pressDigit('7'));

    expect(await screen.findByRole('button', { name: CLEAR_ENTRY_KEY.name })).toBeInTheDocument();

    await user.keyboard(key);

    expect(store.getState().calculator.entry).toBe('');
    expect(screen.getByRole('button', { name: ALL_CLEAR_KEY.name })).toBeInTheDocument();
  });

  it('applies the percent with the % key', async () => {
    const { store, user } = renderFunctionPad();
    store.dispatch(pressDigit('5'));

    await user.keyboard('%');

    expect(store.getState().calculator.entry).toBe('0.05');
  });
});
