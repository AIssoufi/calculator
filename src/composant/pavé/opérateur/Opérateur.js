import React from 'react';

import Bouton from '../../partagé/bouton/Bouton';
import './Opérateur.css';

export default function Opérateur (props) {
  return (
          <div className="operateur_container">
            <Bouton label="/" />
            <Bouton label="X" />
            <Bouton label="—" />
            <Bouton label="+" />
            <Bouton label="=" />
          </div>
  );
};