import React from 'react';
import { useSelector } from 'react-redux';

import './Screen.css';

import { selectDisplayValue } from '../../../features/calculator/calculatorSlice';
import { getTextLengthStyle } from './utils';

/**
 * Renders the screen of the calculator: the entry, the running total, the result or an error
 * message, in a font that shrinks to fit a long number, plus a large faded copy in the background.
 * Must be rendered inside a react-redux `<Provider>`.
 */
export function Screen() {
  const result = useSelector(selectDisplayValue);

  return (
    <div className="screen_wrapper">
      <div className="result" style={getTextLengthStyle(result)}>{result}</div>
      <div id="result">{result}</div>
    </div>
  );
};
