import React, { Component } from 'react';

//import Écran from './composant/écran/Écran';
import ÉcranContainer from './containers/ÉcranContainer'
import Pavé  from './composant/pavé/Pavé';

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
