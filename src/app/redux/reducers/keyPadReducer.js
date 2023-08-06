import {
  ADD,
  PRESS_A_NUMERIC_BUTTON,
  DIVIDE,
  MULTIPLY,
  DELETE_ALL,
  SUBSTRACT,
  VALIDATE,
  PERCENTAGE,
  REVERSE_SIGN,
  DISPLAYS
} from '../actions/types';

const initialState = {
  result: 0,
  input: 0,
  operand1: 0,
  operand2: 0,
  operator: '+'
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

function keyPadReducer(state = initialState, action) {
  switch(action.type) {
    case ADD:
      return (state.operand1 && state.operand2) ? {
        ...state,
        result: claculer(state),
        operand1: claculer(state),
        operand2: 0,
        operator: '+'
      } : {
        ...state,
        operand1: (!state.operand1) ? state.input : state.operand1,
        operand2: (state.operand1 && !state.operand2) ? state.input : state.operand2,
        input: 0,
        operator: '+'
      };
    case DIVIDE:
      return (state.operand1 && state.operand2) ? {
        ...state,
        result: claculer(state),
        operand1: claculer(state),
        operand2: 0,
        operator: '/'
      } : {
        ...state,
        operand1: (!state.operand1) ? state.input : state.operand1,
        operand2: (state.operand1 && !state.operand2) ? state.input : state.operand2,
        input: 0,
        operator: '/'
      };
    case MULTIPLY:
      return (state.operand1 && state.operand2) ? {
        ...state,
        result: claculer(state),
        operand1: claculer(state),
        operand2: 0,
        operator: '*'
      } : {
        ...state,
        operand1: (!state.operand1) ? state.input : state.operand1,
        operand2: (state.operand1 && !state.operand2) ? state.input : state.operand2,
        input: 0,
        operator: '*'
      };
    case SUBSTRACT:
      return (state.operand1 && state.operand2) ? {
        ...state,
        result: claculer(state),
        operand1: claculer(state),
        operand2: 0,
        operator: '-'
      } : {
        ...state,
        operand1: (!state.operand1) ? state.input : state.operand1,
        operand2: (state.operand1 && !state.operand2) ? state.input : state.operand2,
        input: 0,
        operator: '-'
      };
    case VALIDATE: // touche égale
      return {
        ...state,
        result: claculer((!state.operand2) ? {
          ...state,
          operand2: state.input
        }: state),
        operand1: claculer((!state.operand2) ? {
          ...state,
          operand2: state.input
        }: state),
        operand2: 0,
        input: 0
      };
    case PRESS_A_NUMERIC_BUTTON:
      const nouveauSaisi = state.input + action.aNumber;
      return {
        ...state,
        input: action.aNumber === '.' ? '' + nouveauSaisi : parseFloat(nouveauSaisi) 
      };
    case DELETE_ALL:
      return {
        ...state,
        result: 0,
        input: 0,
        operand1: 0,
        operand2: 0
      };
    case PERCENTAGE:
      return {
        ...state,
        result: (action.display === DISPLAYS.RESULT) ? state.result / 100 : state.result,
        input: (action.display === DISPLAYS.INPUT)  ? state.input / 100 : state.input,
        operand1: (action.display === DISPLAYS.OPERAND_1) ? state.operand1 / 100 : state.operand1,
        operand2: (action.display === DISPLAYS.OPERAND_2) ? state.operand2 / 100 : state.operand2
      };
    case REVERSE_SIGN:
      return {
        ...state,
        result: (action.display === DISPLAYS.RESULT) ? state.result * -1 : state.result,
        input: (action.display === DISPLAYS.INPUT) ?  -1 * state.input : state.input,
        operand1: (action.display === DISPLAYS.OPERAND_1) ? state.operand1 * -1 : state.operand1,
        operand2: (action.display === DISPLAYS.OPERAND_2) ? state.operand2 * -1 : state.operand2
      };
    default:
      return state;
  }
}

export default keyPadReducer;