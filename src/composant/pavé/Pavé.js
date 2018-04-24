import React from 'react';

import Fonction  from './fonction/Fonction';

// Containers
import NumériqueContainer from '../../containers/NumériqueContainer';
import OpérateurContainer from '../../containers/OpérateurContainer';

import './Pavé.css';

export default function Pavé(props) {
  return (
    <div className="touche_wrapper">
      <Fonction />
      <NumériqueContainer />
      <OpérateurContainer />
    </div>
  );
};