import React from 'react';

import Bouton from '../../partagé/bouton/Bouton';
import './Numérique.css';

export default function Numérique(props) {
  return (
    <div className="numerique_container">
      <Bouton label="9" />
      <Bouton label="8" />
      <Bouton label="7" />
      <Bouton label="6" />
      <Bouton label="5" />
      <Bouton label="4" />
      <Bouton label="3" />
      <Bouton label="2" />
      <Bouton label="1" />
      <Bouton label="." />
      <Bouton label="0" isLarge />
    </div>
  );
};