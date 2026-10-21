import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import { setupStore } from '../../../store';
import NumberPad from './NumberPad';

const renderNumberPad = () => {
  const store = setupStore();
  render(
    <Provider store={store}>
      <NumberPad />
    </Provider>
  );
  return { store, user: userEvent.setup() };
};

describe('NumberPad', () => {
  it('renders the keys in reading order, row by row', () => {
    renderNumberPad();

    const labels = screen.getAllByRole('button').map(key => key.textContent);

    expect(labels).toEqual(['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.']);
  });

  it('types the digits, the point and the comma from the keyboard', async () => {
    const { store, user } = renderNumberPad();

    await user.keyboard('1,0.5');

    expect(store.getState().calculator.entry).toBe('1.05');
  });

  it('ignores the keys that are not digits or a decimal point', async () => {
    const { store, user } = renderNumberPad();

    await user.keyboard('a+{Enter}');

    expect(store.getState().calculator.entry).toBe('');
  });
});
