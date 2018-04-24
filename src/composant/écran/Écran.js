import React from 'react';
import PropTypes from 'prop-types';

import './Écran.css';

function Écran({ resultat }) {
  return (
    <div className="ecran_wrapper">
      <div id="resultat">{ resultat }</div>
    </div>
  );
};

Écran.PropTypes = {
  resultat: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

export default Écran;
