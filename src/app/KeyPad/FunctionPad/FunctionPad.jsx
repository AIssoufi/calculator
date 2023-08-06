import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Button } from '../../shared';
import './FunctionPad.css';

import { percentage, reverseSign, deleteAll } from "../../../features/keyPad/keyPadSlice";

const FunctionPad = () => {
  const { keyPad, display } = useSelector(state => ({
    keyPad: state.keyPad,
    display: state.screen.display
  }));

  const dispatch = useDispatch();

  const getDeleteLabel = (keyPad) => {
    const { result, input, operand1, operand2 } = keyPad;
    return (!result && !input && !operand1 && !operand2) ? 'AC' : 'C';
  }

  return (
    <div className="function_container"> 
      <Button
        onClick={() => {
          dispatch(deleteAll());
        }}
        label={getDeleteLabel(keyPad)}
      />
      <Button
        onClick={() => {
          dispatch(reverseSign(display));
        }}
        label="+/-"
      />
      <Button
        onClick={() => {
          dispatch(percentage(display));
        }}
        label="%"
      />
    </div>
  );
};

export default FunctionPad;