import { configureStore } from "@reduxjs/toolkit";
import calculatorReducer from "../features/calculator/calculatorSlice";

/**
 * Creates a store holding the calculator state at its initial values.
 * The app uses the single `store` below; each test creates its own, so no state leaks between tests.
 *
 * @returns {import('@reduxjs/toolkit').EnhancedStore} A new store.
 */
export const setupStore = () => configureStore({
    reducer: {
        calculator: calculatorReducer
    },
});

export const store = setupStore();
