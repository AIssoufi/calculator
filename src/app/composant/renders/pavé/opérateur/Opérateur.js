import React from 'react';

import Bouton from '../../partagé/bouton/Bouton';
import './Opérateur.css';

export default function Opérateur({ 
  appuyerLaToucheDivision, 
  appuyerLaToucheAddition, 
  appuyerLaToucheMultiplier, 
  appuyerLaToucheSoustraire, 
  appuyerLaToucheÉgale 
}) {
  return (
    <div className="operateur_container">
      <Bouton auClique={ appuyerLaToucheDivision } label="/" />
      <Bouton auClique={ appuyerLaToucheMultiplier } label="X" />
      <Bouton auClique={ appuyerLaToucheSoustraire } label="—" />
      <Bouton auClique={ appuyerLaToucheAddition } label="+" />
      <Bouton auClique={ appuyerLaToucheÉgale } label="=" />
    </div>
  );
};