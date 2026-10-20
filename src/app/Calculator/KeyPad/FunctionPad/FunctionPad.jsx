import { useSelector, useDispatch } from 'react-redux';

import { Button } from '../shared';
import './FunctionPad.css';

import {
  pressAllClear,
  pressClearEntry,
  pressPercent,
  pressToggleSign,
  selectCanClearEntry
} from "../../../../features/calculator/calculatorSlice";

const ALL_CLEAR_LABEL = 'AC';
const CLEAR_ENTRY_LABEL = 'C';

/**
 * Renders the function keys of the keypad: clear, sign and percent.
 * The clear key reads `C` and clears the entry while there is one, then reads `AC` and resets
 * everything. Must be rendered inside a react-redux `<Provider>`.
 */
const FunctionPad = () => {
  const canClearEntry = useSelector(selectCanClearEntry);

  const dispatch = useDispatch();

  return (
    <div className="function_container">
      <Button
        onClick={() => {
          dispatch(canClearEntry ? pressClearEntry() : pressAllClear());
        }}
        label={canClearEntry ? CLEAR_ENTRY_LABEL : ALL_CLEAR_LABEL}
      />
      <Button
        onClick={() => {
          dispatch(pressToggleSign());
        }}
        label="+/-"
      />
      <Button
        onClick={() => {
          dispatch(pressPercent());
        }}
        label="%"
      />
    </div>
  );
};

export default FunctionPad;
