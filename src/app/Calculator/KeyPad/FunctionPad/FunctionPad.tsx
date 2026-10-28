import { useAppDispatch, useAppSelector } from '../../../hooks';
import { Button } from '../shared';
import './FunctionPad.css';

import {
  pressAllClear,
  pressClearEntry,
  pressPercent,
  pressToggleSign,
  selectCanClearEntry
} from '../../../../features/calculator/calculatorSlice';
import {
  ALL_CLEAR_KEY,
  CLEAR_ENTRY_KEY,
  CLEAR_SHORTCUTS,
  PERCENT_SHORTCUTS,
  TOGGLE_SIGN_NAME
} from './constants';

/**
 * Renders the function keys of the keypad: clear, sign and percent.
 * The clear key reads `C` and clears the entry while there is one, then reads `AC` and resets
 * everything. Escape or Backspace presses the clear key, and `%` the percent key.
 * Must be rendered inside a react-redux `<Provider>`.
 */
const FunctionPad = () => {
  const canClearEntry = useAppSelector(selectCanClearEntry);

  const dispatch = useAppDispatch();
  const clearKey = canClearEntry ? CLEAR_ENTRY_KEY : ALL_CLEAR_KEY;

  return (
    <div className="function_container">
      <Button
        onClick={() => {
          dispatch(canClearEntry ? pressClearEntry() : pressAllClear());
        }}
        label={clearKey.label}
        ariaLabel={clearKey.name}
        shortcuts={CLEAR_SHORTCUTS}
      />
      <Button
        onClick={() => {
          dispatch(pressToggleSign());
        }}
        label="+/-"
        ariaLabel={TOGGLE_SIGN_NAME}
      />
      <Button
        onClick={() => {
          dispatch(pressPercent());
        }}
        label="%"
        shortcuts={PERCENT_SHORTCUTS}
      />
    </div>
  );
};

export default FunctionPad;
