import React, { Component } from 'react';

import { ScreenContainer } from './components/containers'
import { KeyPad, Author }  from './components/renders';

import './Calculator.css';

export default class Calculator extends Component {
  render() {
    return (
      <div className="main_wrapper">
        <ScreenContainer />
        <KeyPad  />
        <Author />
      </div>
    );
  }
}
