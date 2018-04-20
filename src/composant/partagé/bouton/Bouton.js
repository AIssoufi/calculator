import React from 'react';

import './Bouton.css';

export default function Bouton (props) {
  let style = 'btn';
  style += props.isLarge ? ' btn-large' : '';
  
  return <div className={style}>{ props.label }</div>;
};