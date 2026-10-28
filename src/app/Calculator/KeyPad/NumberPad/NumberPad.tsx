import { useAppDispatch } from '../../../hooks';
import { Button } from '../shared';
import './NumberPad.css';

import { pressDecimalPoint, pressDigit } from '../../../../features/calculator/calculatorSlice';
import { DECIMAL_POINT_SHORTCUTS, ROW_DIGITS, ZERO_DIGIT, ZERO_SHORTCUTS } from './constants';

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
}
