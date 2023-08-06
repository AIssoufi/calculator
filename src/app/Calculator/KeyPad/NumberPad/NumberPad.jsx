import React from 'react';
import { useDispatch } from 'react-redux';

import { Button } from '../shared';
import './NumberPad.css';

import { pressNumericButton } from "../../../../features/keyPad/keyPadSlice";
import { display } from "../../../../features/screen/screenSlice";
import { DISPLAYS } from '../../../constants';

export default function NumberPad() {
  const dispatch = useDispatch();

  const pressKeyNumber = number => {
    dispatch(pressNumericButton(number));
    dispatch(display(DISPLAYS.INPUT))
  };

  return (
    <div className="numerique_container">
      <Button onClick={pressKeyNumber} label="9" />
      <Button onClick={pressKeyNumber} label="8" />
      <Button onClick={pressKeyNumber} label="7" />
      <Button onClick={pressKeyNumber} label="6" />
      <Button onClick={pressKeyNumber} label="5" />
      <Button onClick={pressKeyNumber} label="4" />
      <Button onClick={pressKeyNumber} label="3" />
      <Button onClick={pressKeyNumber} label="2" />
      <Button onClick={pressKeyNumber} label="1" />
      <Button onClick={pressKeyNumber} label="." />
      <Button onClick={pressKeyNumber} label="0" isLarge />
    </div>
  );
};