import React from 'react';

// Containers
import FunctionPad from './FunctionPad';
import NumberPad from './NumberPad';
import OperatorPad from './OperatorPad';

// CSS
import './KeyPad.css';

export function KeyPad() {
  return (
    <div className="keyPad_wrapper">
      <FunctionPad />
      <NumberPad />
      <OperatorPad />
    </div>
  );
};
