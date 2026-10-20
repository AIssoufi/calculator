// Containers
import FunctionPad from './FunctionPad';
import NumberPad from './NumberPad';
import OperatorPad from './OperatorPad';

// CSS
import './KeyPad.css';

/**
 * Renders the keypad of the calculator: the function keys, the digit keys and the operator keys.
 * Must be rendered inside a react-redux `<Provider>`.
 */
export function KeyPad() {
  return (
    <div className="keyPad_wrapper">
      <FunctionPad />
      <NumberPad />
      <OperatorPad />
    </div>
  );
};
