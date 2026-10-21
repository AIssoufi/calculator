import { useDispatch } from 'react-redux';

import type { AppDispatch } from '../../types';

/**
 * Returns the `dispatch` of the store, typed with the actions of its slices. Use it instead of the
 * `useDispatch` of React Redux. Must be called inside a react-redux `<Provider>`.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
