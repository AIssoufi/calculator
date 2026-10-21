import { OPERATORS } from "../../../../features/calculator/constants";

/**
 * Operator keys from top to bottom: the label shown, the name read by screen readers when the
 * label is a symbol they would misread, and the operator it presses, which is also its key on
 * the keyboard.
 */
export const OPERATOR_KEYS = [
  { label: '/', name: 'Diviser', operator: OPERATORS.DIVIDE },
  { label: 'X', name: 'Multiplier', operator: OPERATORS.MULTIPLY },
  { label: '—', name: 'Moins', operator: OPERATORS.SUBTRACT },
  { label: '+', name: undefined, operator: OPERATORS.ADD }
];

/** Keys that press `=`: the sign itself, and Enter unless a button or link has the focus. */
export const EQUALS_SHORTCUTS = ['=', 'Enter'];
