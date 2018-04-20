import React from 'react';

import Numérique from './numérique/Numérique';
import Fonction  from './fonction/Fonction';
import Opérateur from './opérateur/Opérateur';

import './Pavé.css';

export default function Pavé (props) {
  return (
    <div className="touche_wrapper">
      <Fonction />
      <Numérique />
      <Opérateur />
    </div>
  );
};