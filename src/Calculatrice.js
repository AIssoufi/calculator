import React, { Component } from 'react';
import './Calculatrice.css';

class Calculatrice extends Component {
  render() {
    return (
      <div className="main_wrapper">
        <div className="ecran_wrapper">
          <div id="resultat">0</div>
        </div>
        <div className="touche_wrapper">
          <div className="fonction_container">
            <div className="btn">AC</div>
            <div className="btn">+/-</div>
            <div className="btn">%</div>
          </div>
          <div className="numerique_container">
            <div className="btn">9</div>
            <div className="btn">8</div>
            <div className="btn">7</div>
            <div className="btn">6</div>
            <div className="btn">5</div>
            <div className="btn">4</div>
            <div className="btn">3</div>
            <div className="btn">2</div>
            <div className="btn">1</div>
            <div className="btn">.</div>
            <div className="btn btn-large">0</div>
          </div>
          <div className="operateur_container">
            <div className="btn">/</div>
            <div className="btn">X</div>
            <div className="btn">—</div>
            <div className="btn">+</div>
            <div className="btn"> = </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Calculatrice;
