import type { setupStore } from './store';

/** Store of the app, as {@link setupStore} creates it. */
export type AppStore = ReturnType<typeof setupStore>;

/** State of the whole store, one key per slice, such as `calculator`. */
export type RootState = ReturnType<AppStore['getState']>;

/** `dispatch` of the store, which accepts the actions of its slices. */
export type AppDispatch = AppStore['dispatch'];
