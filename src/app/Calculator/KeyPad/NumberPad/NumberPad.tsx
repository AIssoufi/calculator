import { useAppDispatch } from '../../../hooks';
import { Button } from '../shared';
import './NumberPad.css';

import { pressDecimalPoint, pressDigit } from "../../../../features/calculator/calculatorSlice";

/** Digits of the rows above the `0` key, in the order they are shown and tabbed through. */
const ROW_DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

/** The `0` key, on the large bottom key of the pad. */
const ZERO_DIGIT = '0';

/** Keys that type the decimal point: the point, and the comma of French keyboards. */
const DECIMAL_POINT_SHORTCUTS = ['.', ','];

/** Key that types the `0`. */
const ZERO_SHORTCUTS = [ZERO_DIGIT];

/**
 * Renders the digit keys and the decimal point key of the keypad, which type the entry; the digit
 * and decimal point keys of the keyboard press them too.
 * Must be rendered inside a react-redux `<Provider>`.
 */
export default function NumberPad() {
  const dispatch = useAppDispatch();

  const pressDigitKey = (digit: string) => {
    dispatch(pressDigit(digit));
  };
  const pressDecimalPointKey = () => {
    dispatch(pressDecimalPoint());
  };

  return (
    <div className="numeric_container">
      {ROW_DIGITS.map(digit => (
        <Button key={digit} onClick={pressDigitKey} label={digit} shortcuts={[digit]} />
      ))}
      <Button onClick={pressDigitKey} label={ZERO_DIGIT} shortcuts={ZERO_SHORTCUTS} isLarge />
      <Button onClick={pressDecimalPointKey} label="." shortcuts={DECIMAL_POINT_SHORTCUTS} />
    </div>
  );
};
