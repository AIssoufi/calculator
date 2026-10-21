import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import { selectDisplayValue } from '../../../features/calculator/calculatorSlice';
import { setupStore } from '../../store';
import { KeyPad } from './KeyPad';

const KEYPAD_SELECTOR = '.keyPad_wrapper';
const PAD_SELECTORS = ['.function_container', '.numeric_container', '.operator_container'];

/** Keys of the keypad: 3 function keys, 10 digits and the point, 4 operators and `=`. */
const KEY_COUNT = 19;

const renderKeyPad = () => {
  const store = setupStore();
  const { container } = render(
    <Provider store={store}>
      <KeyPad />
    </Provider>
  );
  return { container, store, user: userEvent.setup() };
};

describe('KeyPad', () => {
  it('renders the function, digit and operator pads, in that order, inside the keypad', () => {
    const { container } = renderKeyPad();
    const keyPad = container.querySelector(KEYPAD_SELECTOR);
    const padClasses = Array.from(keyPad?.children ?? [], pad => `.${pad.className}`);

    expect(padClasses).toEqual(PAD_SELECTORS);
  });

  it('renders every key of the calculator, from AC to =', () => {
    renderKeyPad();
    const labels = screen.getAllByRole('button').map(key => key.textContent);

    expect(labels).toHaveLength(KEY_COUNT);
    expect(labels[0]).toBe('AC');
    expect(labels.at(-1)).toBe('=');
  });

  it('computes with the keys of its three pads together', async () => {
    const { store, user } = renderKeyPad();

    await user.click(screen.getByRole('button', { name: '7' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '%' }));
    await user.click(screen.getByRole('button', { name: '=' }));

    expect(selectDisplayValue(store.getState())).toBe('7.05');
  });
});
