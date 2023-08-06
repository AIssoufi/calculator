import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '../../shared';
import './NumberPad.css';

export default function NumberPad({ onPressNumberKey }) {
  return (
    <div className="numerique_container">
      <Button onClick={ onPressNumberKey } label="9" />
      <Button onClick={ onPressNumberKey } label="8" />
      <Button onClick={ onPressNumberKey } label="7" />
      <Button onClick={ onPressNumberKey } label="6" />
      <Button onClick={ onPressNumberKey } label="5" />
      <Button onClick={ onPressNumberKey } label="4" />
      <Button onClick={ onPressNumberKey } label="3" />
      <Button onClick={ onPressNumberKey } label="2" />
      <Button onClick={ onPressNumberKey } label="1" />
      <Button onClick={ onPressNumberKey } label="." />
      <Button onClick={ onPressNumberKey } label="0" isLarge />
    </div>
  );
};

NumberPad.propTypes = {
  onPressNumberKey: PropTypes.func,
};

NumberPad.defaultProps = {
  onPressNumberKey: undefined,
}