import { calculatorSlice, pressDigit } from '../features/calculator/calculatorSlice';
import { setupStore } from './store';

describe('setupStore', () => {
  it('starts with the initial state of every slice', () => {
    expect(setupStore().getState()).toEqual({
      calculator: calculatorSlice.getInitialState()
    });
  });

  it('creates a new store on each call, so a dispatch never reaches another store', () => {
    const firstStore = setupStore();
    const secondStore = setupStore();

    firstStore.dispatch(pressDigit('7'));

    expect(firstStore.getState().calculator.entry).toBe('7');
    expect(secondStore.getState().calculator).toEqual(calculatorSlice.getInitialState());
  });
});
