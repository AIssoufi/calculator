import { useAppDispatch } from '../../../hooks';
import { Button } from '../shared';
import './OperatorPad.css';

import { pressEquals, pressOperator } from "../../../../features/calculator/calculatorSlice";
import { OPERATORS } from "../../../../features/calculator/constants";

/** Operator keys from top to bottom: the label shown and the operator it presses. */
const OPERATOR_KEYS = [
  { label: '/', operator: OPERATORS.DIVIDE },
  { label: 'X', operator: OPERATORS.MULTIPLY },
  { label: '—', operator: OPERATORS.SUBTRACT },
  { label: '+', operator: OPERATORS.ADD }
];

/**
 * Renders the column of operator keys and the `=` key of the keypad.
 * Must be rendered inside a react-redux `<Provider>`.
 */
export default function OperatorPad() {
  const dispatch = useAppDispatch();

  const pressEqualKey = () => {
    dispatch(pressEquals());
  };

  return (
    <div className="operator_container">
      {OPERATOR_KEYS.map(({ label, operator }) => (
        <Button key={operator} onClick={() => dispatch(pressOperator(operator))} label={label} />
      ))}
      <Button onClick={pressEqualKey} label="=" />
    </div>
  );
};
