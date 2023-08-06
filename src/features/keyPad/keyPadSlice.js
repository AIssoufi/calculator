import { createSlice } from "@reduxjs/toolkit";

const DISPLAYS = {
    RESULT: 'RESULT',
    INPUT: 'INPUT',
    OPERAND_1: 'OPERAND_1',
    OPERAND_2: 'OPERAND_2'
  }

const initialState = {
    result: 0,
    input: 0,
    operand1: 0,
    operand2: 0,
    operator: ''
};

function claculer({ operator, operand1, operand2 }) {
    switch(operator) {
      case '+':
        return operand1 + operand2;
      case '-':
        return operand1 - operand2;
      case '*':
        return operand1 * operand2;
      case '/':
        return operand1 / operand2;
      default:
        return 0;
    }
  }

export const keyPadSlice = createSlice({
    name: 'keyPad',
    initialState,
    reducers: {
        add: (state, action) => {
            if (state.operand1 && state.operand2) {
                state.result = claculer(state);
                state.operand1 = claculer(state);
                state.operand2 = 0;
            } else {
                if (!state.operand1) {
                    state.operand1 = state.input;
                    state.operand2 = 0;
                } else {
                    state.operand2 = state.input;
                }
                state.input = 0;
            }
            state.operator = '+';
        },
        divide: (state, action) => {
            if (state.operand1 && state.operand2) {
                state.result = claculer(state);
                state.operand1 = claculer(state);
                state.operand2 = 0;
            } else {
                if (!state.operand1) {
                    state.operand1 = state.input;
                    state.operand2 = 0;
                } else {
                    state.operand2 = state.input;
                }
                state.input = 0;
            }
            state.operator = '/';
        },
        multiply: (state, action) => {
            if (state.operand1 && state.operand2) {
                state.result = claculer(state);
                state.operand1 = claculer(state);
                state.operand2 = 0;
            } else {
                if (!state.operand1) {
                    state.operand1 = state.input;
                    state.operand2 = 0;
                } else {
                    state.operand2 = state.input;
                }
                state.input = 0;
            }
            state.operator = '*';
        },
        substract: (state, action) => {
            if (state.operand1 && state.operand2) {
                state.result = claculer(state);
                state.operand1 = claculer(state);
                state.operand2 = 0;
            } else {
                if (!state.operand1) {
                    state.operand1 = state.input;
                    state.operand2 = 0;
                } else {
                    state.operand2 = state.input;
                }
                state.input = 0;
            }
            state.operator = '-';
        },
        validate: (state, action) => {
            state.result = claculer(
                (!state.operand2)
                    ? {
                        ...state, operand2: state.input
                    }
                    : state
            );

            state.operand1 = claculer(
                (!state.operand2)
                    ? {
                        ...state,
                        operand2: state.input
                    }
                    : state
            );

            state.operand2 = 0;
            state.input = 0;
        },
        pressNumericButton: (state, action) => {
            const aNumber = action.payload;
            const newInput = state.input + aNumber;
            state.input = aNumber === '.' ? '' + newInput : parseFloat(newInput);
        },
        deleteAll: (state, action) => {
            state.result = 0;
            state.input = 0;
            state.operand1 = 0;
            state.operand2 = 0;
        },
        percentage: (state, action) => {
            const displayType = action.payload;
            if (displayType === DISPLAYS.RESULT) {
                state.result = state.result / 100;
            }

            if (displayType === DISPLAYS.INPUT) {
                state.input = state.input / 100;
            }

            if (displayType === DISPLAYS.OPERAND_1) {
                state.operand1 = state.operand1 / 100;
            }

            if (displayType === DISPLAYS.OPERAND_2) {
                state.operand2 = state.operand2 / 100;
            }
        },
        reverseSign: (state, action) => {
            const displayType = action.payload;
            if (displayType === DISPLAYS.RESULT) {
                state.result = state.result * -1;
            }

            if (displayType === DISPLAYS.INPUT) {
                state.input = -1 * state.input;
            }

            if (displayType === DISPLAYS.OPERAND_1) {
                state.operand1 = state.operand1 * -1;
            }

            if (displayType === DISPLAYS.OPERAND_2) {
                state.operand2 = state.operand2 * -1;
            }
        }
    }
});

export const {
    add, deleteAll, divide, percentage, pressNumericButton, reverseSign, substract, validate, multiply
} = keyPadSlice.actions;

export default keyPadSlice.reducer;