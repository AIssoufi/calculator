import { configureStore } from "@reduxjs/toolkit";
import keyPadReducer from "../features/keyPad/keyPadSlice";
import screenReducer from "../features/screen/screenSlice";

/**
 * Creates a store holding the calculator state at its initial values.
 * The app uses the single `store` below; each test creates its own, so no state leaks between tests.
 *
 * @returns {import('@reduxjs/toolkit').EnhancedStore} A new store.
 */
export const setupStore = () => configureStore({
    reducer: {
        keyPad: keyPadReducer,
        screen: screenReducer
    },
});

export const store = setupStore();