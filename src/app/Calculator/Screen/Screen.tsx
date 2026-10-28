import { useAppSelector } from '../../hooks';
import './Screen.css';

import { selectDisplayValue } from '../../../features/calculator/calculatorSlice';
import { getTextLengthStyle } from './utils';

/**
 * Renders the screen of the calculator: the entry, the running total, the result or an error
 * message, in a font that shrinks to fit a long number, plus a large faded copy in the background.
 * The text is a polite live region, so screen readers announce each change; the copy is hidden
 * from them.
 * Must be rendered inside a react-redux `<Provider>`.
 */
export function Screen() {
  const result = useAppSelector(selectDisplayValue);

  return (
    <div className="screen_wrapper">
      <div className="result" role="status" style={getTextLengthStyle(result)}>
        {result}
      </div>
      <div id="result" aria-hidden="true">
        {result}
      </div>
    </div>
  );
}
