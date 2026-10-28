import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import { pressDigit, selectDisplayValue } from '../../../../features/calculator/calculatorSlice';
import { setupStore } from '../../../store';
import { OPERATOR_KEYS } from './constants';
import OperatorPad from './OperatorPad';

const renderOperatorPad = () => {
  const store = setupStore();
  render(
    <Provider store={store}>
      <OperatorPad />
    </Provider>
  );
  return { store, user: userEvent.setup() };
};

describe('OperatorPad', () => {
  it.each([...OPERATOR_KEYS.map(({ label, name }) => [name ?? label, label]), ['=', '=']])(
    'names the %s key for screen readers, showing %s',
    (name, label) => {
      renderOperatorPad();

      expect(screen.getByRole('button', { name })).toHaveTextContent(label);
    }
  );

  it.each([
    ['+', '9'],
    ['-', '3'],
    ['*', '18'],
    ['/', '2']
  ])('applies the %s operator typed on the keyboard, then = gives %s', async (operator, result) => {
    const { store, user } = renderOperatorPad();
    store.dispatch(pressDigit('6'));

    await user.keyboard(operator);
    store.dispatch(pressDigit('3'));
    await user.keyboard('=');

    expect(selectDisplayValue(store.getState())).toBe(result);
  });

  it('presses = with Enter when no button has the focus', async () => {
    const { store, user } = renderOperatorPad();
    store.dispatch(pressDigit('6'));

    await user.keyboard('+');
    store.dispatch(pressDigit('1'));
    await user.keyboard('{Enter}');

    expect(selectDisplayValue(store.getState())).toBe('7');
  });
});
