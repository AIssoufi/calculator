import { Screen } from './Screen';
import { KeyPad } from './KeyPad';
import { Author } from './Author';

import './Calculator.css';

/**
 * Renders the calculator as the main landmark of the page: the heading of the page, which only
 * screen readers read, then its screen above its keypad. The author's links follow, outside the
 * calculator so they never cover a key. Must be rendered inside a react-redux `<Provider>`.
 */
const Calculator = () => (
  <>
    <main className="main_wrapper">
      <h1 className="visually-hidden">Calculatrice</h1>
      <Screen />
      <KeyPad />
    </main>
    <Author />
  </>
);

export default Calculator;
