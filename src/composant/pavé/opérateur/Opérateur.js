import React from 'react';

import Bouton from '../../partagé/bouton/Bouton';
import './Opérateur.css';

export default function Opérateur({ 
  onClcikOpérateurDivision, 
  onClcikOpérateurAddition, 
  onClcikOpérateurMultiplier, 
  onClcikOpérateurSoustraire, 
  onClcikOpérateurValider 
}) {
  return (
    <div className="operateur_container">
      <Bouton onClick={ onClcikOpérateurDivision } label="/" />
      <Bouton onClick={ onClcikOpérateurMultiplier } label="X" />
      <Bouton onClick={ onClcikOpérateurSoustraire } label="—" />
      <Bouton onClick={ onClcikOpérateurAddition } label="+" />
      <Bouton onClick={ onClcikOpérateurValider } label="=" />
    </div>
  );
};