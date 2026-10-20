import React from 'react';
import { useSelector } from 'react-redux';

import './Screen.css';

import { selectDisplayValue } from '../../../features/calculator/calculatorSlice';

/**
 * Renders the screen of the calculator: the entry, the running total, the result or an error
 * message, plus a large faded copy in the background. Must be rendered inside a react-redux
 * `<Provider>`.
 */
export function Screen() {
  const result = useSelector(selectDisplayValue);

  return (
    <div className="screen_wrapper">
      <div className="result">{result}</div>
      <div id="result">{result}</div>
    </div>
  );
};
