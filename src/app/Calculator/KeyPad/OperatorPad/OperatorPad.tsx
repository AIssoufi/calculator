import { useAppDispatch } from '../../../hooks';
import { Button } from '../shared';
import './OperatorPad.css';

import { pressEquals, pressOperator } from "../../../../features/calculator/calculatorSlice";
import { OPERATORS } from "../../../../features/calculator/constants";

/**
 * Operator keys from top to bottom: the label shown, the name read by screen readers when the
 * label is a symbol they would misread, and the operator it presses, which is also its key on
 * the keyboard.
 */
const OPERATOR_KEYS = [
  { label: '/', name: 'Diviser', operator: OPERATORS.DIVIDE },
  { label: 'X', name: 'Multiplier', operator: OPERATORS.MULTIPLY },
  { label: '—', name: 'Moins', operator: OPERATORS.SUBTRACT },
  { label: '+', name: undefined, operator: OPERATORS.ADD }
];

/** Keys that press `=`: the sign itself, and Enter unless a button or link has the focus. */
const EQUALS_SHORTCUTS = ['=', 'Enter'];

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
      {OPERATOR_KEYS.map(({ label, name, operator }) => (
        <Button
          key={operator}
          onClick={() => dispatch(pressOperator(operator))}
          label={label}
          ariaLabel={name}
          shortcuts={[operator]}
        />
      ))}
      <Button onClick={pressEqualKey} label="=" shortcuts={EQUALS_SHORTCUTS} />
    </div>
  );
};
