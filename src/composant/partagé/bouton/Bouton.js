import React from 'react';
import PropTypes from 'prop-types';

import './Bouton.css';

function Bouton({ onClick, label, valeur, isLarge }) {
  let style = 'btn';
  style += isLarge ? ' btn-large' : '';
  
  return <div onClick={ () => { onClick(label); }} className={style}>{ label }</div>;
};

Bouton.PropTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string.isRequired, 
  valeur: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]), 
  isLarge: PropTypes.bool
};

export default Bouton;