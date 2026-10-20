import { createSlice } from '@reduxjs/toolkit';

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

/**
 * Redux slice of the calculator: a thin wrapper that hands each key press to the engine,
 * which holds all the logic.
 */
export const calculatorSlice = createSlice({
    name: 'calculator',
    initialState: INITIAL_STATE,
    reducers: {
        pressDigit: (state, action) => inputDigit({ state, digit: action.payload }),
        pressDecimalPoint: state => inputDecimalPoint(state),
        pressOperator: (state, action) => chooseOperator({ state, operator: action.payload }),
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
 * @param {{ calculator: import('./engine').CalculatorState }} state - Root state of the store.
 * @returns {string} The error message, the entry or the running total.
 */
export const selectDisplayValue = state => getDisplayValue(state.calculator);

/**
 * Selects whether the clear key clears the entry (`C`) rather than everything (`AC`).
 *
 * @param {{ calculator: import('./engine').CalculatorState }} state - Root state of the store.
 * @returns {boolean} Whether there is an entry or an error to clear.
 */
export const selectCanClearEntry = state => canClearEntry(state.calculator);

export default calculatorSlice.reducer;
