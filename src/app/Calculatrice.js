import React, { Component } from 'react';

import ÉcranContainer from './composant/containers/ÉcranContainer'
import Pavé  from './composant/renders/pavé/Pavé';
import Auteur from './composant/renders/auteur/Auteur'

import './Calculatrice.css';

export default class Calculatrice extends Component {
  render() {
    return (
      <div className="main_wrapper">
        <ÉcranContainer />
        <Pavé  />
        <Auteur />
      </div>
    );
  }
}
