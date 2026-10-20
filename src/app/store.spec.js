import { keyPadSlice, pressNumericButton } from '../features/keyPad/keyPadSlice';
import { screenSlice } from '../features/screen/screenSlice';
import { setupStore } from './store';

describe('setupStore', () => {
  it('starts with the initial state of every slice', () => {
    expect(setupStore().getState()).toEqual({
      keyPad: keyPadSlice.getInitialState(),
      screen: screenSlice.getInitialState()
    });
  });

  it('creates a new store on each call, so a dispatch never reaches another store', () => {
    const firstStore = setupStore();
    const secondStore = setupStore();

    firstStore.dispatch(pressNumericButton('7'));

    expect(firstStore.getState().keyPad.input).toBe(7);
    expect(secondStore.getState().keyPad).toEqual(keyPadSlice.getInitialState());
  });
});
