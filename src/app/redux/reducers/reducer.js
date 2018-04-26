import { combineReducers } from 'redux';
import pavé from './pavé';
import écran from './écran';

const reduceurCalculatrice = combineReducers({
  pavé,
  écran
});

export default reduceurCalculatrice;