import { Screen } from './Screen';
import { KeyPad } from './KeyPad';
import { Author }  from './Author';

import './Calculator.css';

/**
 * Renders the calculator, its screen above its keypad, followed by the author's links, which sit
 * outside the calculator so they never cover a key. Must be rendered inside a react-redux
 * `<Provider>`.
 */
const Calculator = () => (
  <>
    <div className="main_wrapper">
      <Screen />
      <KeyPad  />
    </div>
    <Author />
  </>
);

export default Calculator;
