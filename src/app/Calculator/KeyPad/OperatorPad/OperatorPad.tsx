import { useAppDispatch } from '../../../hooks';
import { Button } from '../shared';
import './OperatorPad.css';

import { pressEquals, pressOperator } from "../../../../features/calculator/calculatorSlice";
import { EQUALS_SHORTCUTS, OPERATOR_KEYS } from "./constants";

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
