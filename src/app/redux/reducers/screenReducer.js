import {
  DISPLAY,
  DISPLAYS
} from '../actions/types';

const initialState = {
  display: DISPLAYS.INPUT
}

function screenReducer(state = initialState, action) {
  switch(action.type) {
    case DISPLAY:
      return {
        ...state,
        display: action.display,
      };
    default:
      return state;
  }
};

export default screenReducer;