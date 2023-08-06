import React from 'react';
import { useDispatch } from 'react-redux';

import { Button } from '../../shared';
import './OperatorPad.css';

import { add, divide, multiply, substract, validate } from "../../../features/keyPad/keyPadSlice";
import { display } from "../../../features/screen/screenSlice";
import { DISPLAYS } from '../../constants';

export default function OperatorPad() {
  const dispatch = useDispatch();

  const pressAddKey = () => {
    dispatch(add());
    dispatch(display(DISPLAYS.OPERAND_1));
  };
  const pressDivideKey = () => {
    dispatch(divide());
    dispatch(display(DISPLAYS.OPERAND_1));
  };
  const pressMultiplyKey = () => {
    dispatch(multiply());
    dispatch(display(DISPLAYS.OPERAND_1));
  };
  const pressSubstractKey = () => {
    dispatch(substract());
    dispatch(display(DISPLAYS.OPERAND_1));
  };
  const pressEqualKey = () => {
    dispatch(validate());
    dispatch(display(DISPLAYS.RESULT));
  }

  return (
    <div className="operateur_container">
      <Button onClick={pressDivideKey} label="/" />
      <Button onClick={pressMultiplyKey} label="X" />
      <Button onClick={pressSubstractKey} label="—" />
      <Button onClick={pressAddKey} label="+" />
      <Button onClick={pressEqualKey} label="=" />
    </div>
  );
};