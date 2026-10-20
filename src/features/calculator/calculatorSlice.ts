import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { INITIAL_STATE } from './constants';
import {
    applyPercent,
    canClearEntry,
    chooseOperator,
    clearAll,
    clearEntry,
    evaluate,
    getDisplayValue,
    inputDecimalPoint,
    inputDigit,
    toggleSign
} from './engine';
import type { CalculatorState, Operator } from './types';

/** Part of the root state that the selectors of this slice read. */
interface CalculatorRootState {
    /** State of this slice, under the key the store gives it. */
    calculator: CalculatorState;
}

/**
 * Redux slice of the calculator: a thin wrapper that hands each key press to the engine,
 * which holds all the logic.
 */
export const calculatorSlice = createSlice({
    name: 'calculator',
    initialState: INITIAL_STATE,
    reducers: {
        pressDigit: (state, action: PayloadAction<string>) =>
            inputDigit({ state, digit: action.payload }),
        pressDecimalPoint: state => inputDecimalPoint(state),
        pressOperator: (state, action: PayloadAction<Operator>) =>
            chooseOperator({ state, operator: action.payload }),
        pressEquals: state => evaluate(state),
        pressToggleSign: state => toggleSign(state),
        pressPercent: state => applyPercent(state),
        pressClearEntry: state => clearEntry(state),
        pressAllClear: () => clearAll()
    }
});

export const {
    pressAllClear,
    pressClearEntry,
    pressDecimalPoint,
    pressDigit,
    pressEquals,
    pressOperator,
    pressPercent,
    pressToggleSign
} = calculatorSlice.actions;

/**
 * Selects the text of the screen.
 *
 * @param state - Root state of the store.
 * @returns The error message, the entry or the running total.
 */
export const selectDisplayValue = (state: CalculatorRootState): string =>
    getDisplayValue(state.calculator);

/**
 * Selects whether the clear key clears the entry (`C`) rather than everything (`AC`).
 *
 * @param state - Root state of the store.
 * @returns Whether there is an entry or an error to clear.
 */
export const selectCanClearEntry = (state: CalculatorRootState): boolean =>
    canClearEntry(state.calculator);

/** Reducer of the calculator slice, which the store holds under the `calculator` key. */
export default calculatorSlice.reducer;
