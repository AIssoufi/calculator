import { useSelector, type TypedUseSelectorHook } from 'react-redux';

import type { RootState } from '../../types';

/**
 * Returns the value a selector reads from the state of the store, and renders the component again
 * when that value changes. Use it instead of the `useSelector` of React Redux: the selector gets the
 * typed {@link RootState}. Must be called inside a react-redux `<Provider>`.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
