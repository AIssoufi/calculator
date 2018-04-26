import React from 'react';

import Bouton from '../../partagé/bouton/Bouton';
import './Numérique.css';

export default function Numérique({ appuyerLaToucheNumérique }) {
  return (
    <div className="numerique_container">
      <Bouton auClique={ appuyerLaToucheNumérique } label="9" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="8" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="7" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="6" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="5" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="4" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="3" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="2" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="1" />
      <Bouton auClique={ appuyerLaToucheNumérique } label="." />
      <Bouton auClique={ appuyerLaToucheNumérique } label="0" isLarge />
    </div>
  );
};