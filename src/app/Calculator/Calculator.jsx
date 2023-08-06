import React from 'react';

import { Screen } from './Screen';
import { KeyPad } from './KeyPad';
import { Author }  from './Author';

import './Calculator.css';

const Calculator = () => (
  <div className="main_wrapper">
    <Screen />
    <KeyPad  />
    <Author />
  </div>
);

export default Calculator;
