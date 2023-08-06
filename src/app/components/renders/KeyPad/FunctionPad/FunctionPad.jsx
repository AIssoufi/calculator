import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '../../shared';
import './FunctionPad.css';

export default class FunctionPad extends Component {
  getDeleteLabel(keyPad) {
    const { result, input, operand1, operand2 } = keyPad;
    return (!result && !input && !operand1 && !operand2) ? 'AC' : 'C';
  }

  render() {
    const {
      onPressPercentKey,
      onPressReverseSignKey,
      onPressDeleteAllKey,
      display,
      keyPad
    } = this.props;

    return (
      <div className="function_container"> 
        <Button
          onClick={onPressDeleteAllKey}
          label={this.getDeleteLabel(keyPad)}
        />
        <Button
          onClick={() => {
            onPressReverseSignKey(display);
          }}
          label="+/-"
        />
        <Button
          onClick={() => {
            onPressPercentKey(display);
          }}
          label="%"
        />
      </div>
    );
  }
};

FunctionPad.propTypes = {
  onPressPercentKey: PropTypes.func,
  onPressReverseSignKey: PropTypes.func,
  onPressDeleteAllKey: PropTypes.func,
  display: PropTypes.string,
  keyPad: PropTypes.shape({

  })
};

FunctionPad.defaultProps = {
  onPressPercentKey: undefined,
  onPressReverseSignKey: undefined,
  onPressDeleteAllKey: undefined
}