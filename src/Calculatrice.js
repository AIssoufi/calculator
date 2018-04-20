import React, { Component } from 'react';

import Écran from './composant/écran/Écran';
import Pavé  from './composant/pavé/Pavé';

import './Calculatrice.css';

class Calculatrice extends Component {
  render() {
    return (
      <div className="main_wrapper">
        <Écran />
        <Pavé  />
      </div>
    );
  }
}

export default Calculatrice;
