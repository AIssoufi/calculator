import { configureStore } from "@reduxjs/toolkit";
import calculatorReducer from "../features/calculator/calculatorSlice";

/**
 * Creates a store holding the calculator state at its initial values.
 * The app uses the single `store` below; each test creates its own, so no state leaks between tests.
 *
 * @returns A new store, typed with the state and the actions of its slices.
 */
export const setupStore = () => configureStore({
    reducer: {
        calculator: calculatorReducer
    },
});

/** Store of the app, which `index.tsx` provides to the components. */
export const store = setupStore();
