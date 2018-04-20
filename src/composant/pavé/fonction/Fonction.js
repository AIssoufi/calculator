import React from 'react';

import Bouton from '../../partagé/bouton/Bouton';
import './Fonction.css';

export default function Fonction (props) {
  return (
    <div className="fonction_container">
      <Bouton label="AC" />
      <Bouton label="+/-" />
      <Bouton label="%" />
    </div>
  );
};