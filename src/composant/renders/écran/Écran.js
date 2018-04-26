import React from 'react';
import PropTypes from 'prop-types';

import './Écran.css';

function Écran({ résultat }) {
  return (
    <div className="ecran_wrapper">
      <div id="resultat">{ résultat }</div>
    </div>
  );
};

Écran.propTypes = {
  résultat: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

export default Écran;
