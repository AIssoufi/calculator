import React, { Component } from 'react';

import Bouton from '../../partagé/bouton/Bouton';
import './Fonction.css';

export default class Fonction extends Component {
  obtenirLabelToucheÉffacer(pavé) {
    const { resultat, saisiIntermédiaire, opérande1, opérande2 } = pavé;
    return (!resultat && !saisiIntermédiaire && !opérande1 && !opérande2) ? 'AC' : 'C';
  }

  render() {
    const {
      appuyerLaTouchePourcentage,
      appuyerLaToucheInverserSigne,
      appuyerLaToucheÉffacer,
      état
    } = this.props;

    return (
      <div className="fonction_container"> 
        <Bouton auClique={ appuyerLaToucheÉffacer } label={ this.obtenirLabelToucheÉffacer(état.pavé) } />
        <Bouton auClique={ () => { appuyerLaToucheInverserSigne(état.écran.afficher); }} label="+/-" />
        <Bouton auClique={ () => { appuyerLaTouchePourcentage(état.écran.afficher); }} label="%" />
      </div>
    );
  }
};