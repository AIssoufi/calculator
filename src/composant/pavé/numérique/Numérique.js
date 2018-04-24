import React from 'react';

import Bouton from '../../partagé/bouton/Bouton';
import './Numérique.css';

export default function Numérique({ onTouchNumeriqueClick }) {
  return (
    <div className="numerique_container">
      <Bouton onClick={ onTouchNumeriqueClick } label="9" />
      <Bouton onClick={ onTouchNumeriqueClick } label="8" />
      <Bouton onClick={ onTouchNumeriqueClick } label="7" />
      <Bouton onClick={ onTouchNumeriqueClick } label="6" />
      <Bouton onClick={ onTouchNumeriqueClick } label="5" />
      <Bouton onClick={ onTouchNumeriqueClick } label="4" />
      <Bouton onClick={ onTouchNumeriqueClick } label="3" />
      <Bouton onClick={ onTouchNumeriqueClick } label="2" />
      <Bouton onClick={ onTouchNumeriqueClick } label="1" />
      <Bouton onClick={ onTouchNumeriqueClick } label="." />
      <Bouton onClick={ onTouchNumeriqueClick } label="0" isLarge />
    </div>
  );
};