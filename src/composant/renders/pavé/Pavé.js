import React from 'react';

// Containers
import NumériqueContainer from '../../containers/NumériqueContainer';
import OpérateurContainer from '../../containers/OpérateurContainer';
import FonctionContainer from '../../containers/FonctionContainer';

// CSS
import './Pavé.css';

export default function Pavé(props) {
  return (
    <div className="touche_wrapper">
      <FonctionContainer />
      <NumériqueContainer />
      <OpérateurContainer />
    </div>
  );
};