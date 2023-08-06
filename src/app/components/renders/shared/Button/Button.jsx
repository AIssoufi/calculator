import React from 'react';
import PropTypes from 'prop-types';

import './Button.css';

export function Button({ onClick, label, value, isLarge }) {
  let className = 'btn';

  if (isLarge) {
    className += ' btn-large';
  }
  
  return (
    <div
      onClick={() => {
        onClick(label);
      }}
      className={className}
    >
      {label}
    </div>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string.isRequired, 
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]), 
  isLarge: PropTypes.bool
};

Button.defaultProps = {
  onClick: undefined,
  isLarge: false,
  value: undefined
}