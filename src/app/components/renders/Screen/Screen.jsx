import React from 'react';
import PropTypes from 'prop-types';

import './Screen.css';

export function Screen({ result }) {
  return (
    <div className="screen_wrapper">
      <div className="result">{result}</div>
      <div id="result">{result}</div>
    </div>
  );
};

Screen.propTypes = {
  result: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};
