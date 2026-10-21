import { useAppDispatch, useAppSelector } from '../../../hooks';
import { Button } from '../shared';
import './FunctionPad.css';

import {
  pressAllClear,
  pressClearEntry,
  pressPercent,
  pressToggleSign,
  selectCanClearEntry
} from "../../../../features/calculator/calculatorSlice";

/** Clear key that resets everything: its label, and its name read by screen readers. */
const ALL_CLEAR_KEY = { label: 'AC', name: 'AC, tout effacer' } as const;

/**
 * Clear key while there is an entry. Its name, like the one of {@link ALL_CLEAR_KEY}, starts with
 * the label so that a voice command can say it.
 */
const CLEAR_ENTRY_KEY = { label: 'C', name: 'C, effacer la saisie' } as const;

/** Name of the `+/-` key read by screen readers. */
const TOGGLE_SIGN_NAME = 'Changer de signe';

/** Keys that press the clear key, which clears the entry first, then everything. */
const CLEAR_SHORTCUTS = ['Escape', 'Backspace'];

/** Key that presses the percent key. */
const PERCENT_SHORTCUTS = ['%'];

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
