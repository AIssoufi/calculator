import type { MouseEvent } from 'react';

import { useKeyboardShortcut } from './hooks';
import { KEYBOARD_CLICK_DETAIL } from './constants';
import './Button.css';

/** Props of {@link Button}. */
interface ButtonProps {
  /** Called with the label when the key is pressed. Without it, a press does nothing. */
  onClick?: (label: string) => void;
  /** Text shown on the key and passed to `onClick`. @default '' */
  label?: string;
  /** Name read by screen readers instead of the label, for a label that is a symbol. */
  ariaLabel?: string;
  /** Values of `KeyboardEvent.key` that press the key from anywhere on the page. @default [] */
  shortcuts?: readonly string[];
  /** Whether the key is twice as wide, like the `0` key. @default false */
  isLarge?: boolean;
}

/**
 * Renders a key of the keypad, which passes its label to `onClick` when it is clicked, activated
 * with the keyboard once focused, or pressed with one of its shortcuts, which also shows it
 * pressed. A key clicked with a pointer gives the focus back to the page, so that Enter then means
 * `=` rather than this key again.
 */
export function Button({
  onClick,
  label = '',
  ariaLabel,
  shortcuts,
  isLarge = false
}: ButtonProps) {
  const press = () => {
    onClick?.(label);
  };
  const isPressed = useKeyboardShortcut({ keys: shortcuts, onPress: press });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const isPointerClick = event.detail !== KEYBOARD_CLICK_DETAIL;

    press();

    if (isPointerClick) {
      event.currentTarget.blur();
    }
  };

  let className = 'btn';

  if (isLarge) {
    className += ' btn-large';
  }

  if (isPressed) {
    className += ' btn-pressed';
  }

  return (
    <button type="button" onClick={handleClick} aria-label={ariaLabel} className={className}>
      {label}
    </button>
  );
};
