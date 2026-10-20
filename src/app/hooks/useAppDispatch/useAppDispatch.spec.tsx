import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { pressDigit } from '../../../features/calculator/calculatorSlice';
import { setupStore } from '../../store';
import { useAppDispatch } from './useAppDispatch';

describe('useAppDispatch', () => {
  it('dispatches to the store it is rendered in', () => {
    const store = setupStore();
    const { result } = renderHook(() => useAppDispatch(), {
      wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
    });

    act(() => {
      result.current(pressDigit('4'));
    });

    expect(store.getState().calculator.entry).toBe('4');
  });
});
