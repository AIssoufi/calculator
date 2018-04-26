import React, { Component } from 'react';

import ÉcranContainer from './composant/containers/ÉcranContainer'
import Pavé  from './composant/renders/pavé/Pavé';

import './Calculatrice.css';

class Calculatrice extends Component {
  render() {
    return (
      <div className="main_wrapper">
        <ÉcranContainer />
        <Pavé  />
      </div>
    );
  }
}

export default Calculatrice;
