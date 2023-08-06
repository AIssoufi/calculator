import React from 'react';
import { useSelector } from 'react-redux';

import './Screen.css';

import { DISPLAYS } from '../constants';

const getResult = (keyPad, screen) => {
  switch(screen.display)  {
    case DISPLAYS.RESULT:
      return keyPad.result;
    case DISPLAYS.INPUT:
      return keyPad.input;
    case DISPLAYS.OPERAND_1:
      return keyPad.operand1;
    case DISPLAYS.OPERAND_2:
      return keyPad.operand2;
    default:
      return keyPad.input;
  }
};

export function Screen() {
  const result = useSelector(state => {
    return getResult(state.keyPad, state.screen);
  });

  return (
    <div className="screen_wrapper">
      <div className="result">{result}</div>
      <div id="result">{result}</div>
    </div>
  );
};
