import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '../../shared';
import './OperatorPad.css';

export default function OperatorPad({ 
  onPressDivideKey, 
  onPressAddKey, 
  onPressMultiplyKey, 
  onPressSubstractKey, 
  onPressEqualKey 
}) {
  return (
    <div className="operateur_container">
      <Button onClick={onPressDivideKey} label="/" />
      <Button onClick={onPressMultiplyKey} label="X" />
      <Button onClick={onPressSubstractKey} label="—" />
      <Button onClick={onPressAddKey} label="+" />
      <Button onClick={onPressEqualKey} label="=" />
    </div>
  );
};

OperatorPad.propTypes = {
  onPressDivideKey: PropTypes.func,
  onPressAddKey: PropTypes.func,
  onPressMultiplyKey: PropTypes.func,
  onPressSubstractKey: PropTypes.func,
  onPressEqualKey: PropTypes.func,
};

OperatorPad.defaultProps = {
  onPressDivideKey: undefined,
  onPressAddKey: undefined,
  onPressMultiplyKey: undefined,
  onPressSubstractKey: undefined,
  onPressEqualKey: undefined,
};