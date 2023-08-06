import { 
  ADD, 
  DISPLAY, 
  PRESS_A_NUMERIC_BUTTON, 
  DIVIDE,
  MULTIPLY,
  DELETE_ALL,
  SUBSTRACT,
  VALIDATE,
  REVERSE_SIGN,
  PERCENTAGE
} from './types';

/**
 * Générateurs d'actions
 */
export function add() {
  return { type: ADD};
}

export function show(display) {
   return { type: DISPLAY, display };
}

export function pressOn(aNumber) {
   return { type: PRESS_A_NUMERIC_BUTTON, aNumber };
}
 
export function divide() {
   return { type: DIVIDE };
}

export function multiply() {
   return { type: MULTIPLY };
}

export function deleteAll() {
   return { type: DELETE_ALL };
}

export function substract() {
   return { type: SUBSTRACT };
}

export function validate() {
  return { type: VALIDATE };
}

export function reverseSign(display) {
  return { type: REVERSE_SIGN, display};
}

export function percentage(display) {
  return { type: PERCENTAGE, display };
}