import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { pressDigit } from '../../../features/calculator/calculatorSlice';
import { setupStore } from '../../store';
import type { AppStore } from '../../types';
import { useAppSelector } from './useAppSelector';

// Renders the hook with a selector of the entry, inside a provider of the given store.
const renderEntryHook = (store: AppStore) =>
  renderHook(() => useAppSelector(state => state.calculator.entry), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )
  });

describe('useAppSelector', () => {
  it('reads the state of the store it is rendered in', () => {
    const store = setupStore();
    store.dispatch(pressDigit('7'));

    const { result } = renderEntryHook(store);

    expect(result.current).toBe('7');
  });

  it('returns the new value after a dispatch changes it', () => {
    const store = setupStore();
    const { result } = renderEntryHook(store);

    act(() => {
      store.dispatch(pressDigit('4'));
    });

    expect(result.current).toBe('4');
  });
});
