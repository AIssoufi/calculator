import React from 'react';

// Containers
import { NumberPadContainer, OperatorPadContainer, FunctionContainer } from '../../containers';

// CSS
import './KeyPad.css';

export function KeyPad() {
  return (
    <div className="keyPad_wrapper">
      <FunctionContainer />
      <NumberPadContainer />
      <OperatorPadContainer />
    </div>
  );
};
