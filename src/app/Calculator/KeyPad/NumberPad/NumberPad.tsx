import { useDispatch } from 'react-redux';

import { Button } from '../shared';
import './NumberPad.css';

import { pressDecimalPoint, pressDigit } from "../../../../features/calculator/calculatorSlice";

/**
 * Renders the digit keys and the decimal point key of the keypad, which type the entry.
 * Must be rendered inside a react-redux `<Provider>`.
 */
export default function NumberPad() {
  const dispatch = useDispatch();

  const pressDigitKey = (digit: string) => {
    dispatch(pressDigit(digit));
  };
  const pressDecimalPointKey = () => {
    dispatch(pressDecimalPoint());
  };

  return (
    <div className="numeric_container">
      <Button onClick={pressDigitKey} label="9" />
      <Button onClick={pressDigitKey} label="8" />
      <Button onClick={pressDigitKey} label="7" />
      <Button onClick={pressDigitKey} label="6" />
      <Button onClick={pressDigitKey} label="5" />
      <Button onClick={pressDigitKey} label="4" />
      <Button onClick={pressDigitKey} label="3" />
      <Button onClick={pressDigitKey} label="2" />
      <Button onClick={pressDigitKey} label="1" />
      <Button onClick={pressDecimalPointKey} label="." />
      <Button onClick={pressDigitKey} label="0" isLarge />
    </div>
  );
};
