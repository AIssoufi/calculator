import React from 'react';

import './Button.css';

/**
 * Renders a key of the keypad, which passes its label to `onClick` when it is pressed.
 *
 * @param {object} props
 * @param {(label: string) => void} [props.onClick] - Called with the label on a press.
 * @param {string} [props.label] - Text shown on the key and passed to `onClick`.
 * @param {boolean} [props.isLarge=false] - Makes the key twice as wide, like the `0` key.
 */
export function Button({ onClick, label = '', isLarge = false }) {
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
