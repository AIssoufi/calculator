import { combineReducers } from 'redux';
import keyPadReducer from './keyPadReducer';
import screenReducer from './screenReducer';

const calculatorReducer = combineReducers({
  keyPad: keyPadReducer,
  screen: screenReducer
});

export default calculatorReducer;