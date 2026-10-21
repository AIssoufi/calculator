import { useEffect, useEffectEvent, useState } from 'react';

import { NO_KEYS } from './constants';
import { isShortcutPress } from './utils';

/** Options of {@link useKeyboardShortcut}. */
interface UseKeyboardShortcutParams {
  /** Values of `KeyboardEvent.key` that press the shortcut, such as `Enter`. @default [] */
  keys?: readonly string[];
  /** Called each time one of the keys is pressed. Without it, a press only shows. */
  onPress?: () => void;
}

/**
 * Listens to the keyboard of the whole page and calls `onPress` when one of the keys is pressed,
 * unless it is combined with Ctrl, Meta or Alt, or is Enter on a focused button or link (see
 * `isShortcutPress`). The browser's own action of a shortcut key, such as the quick find of `/`
 * in Firefox, is prevented. A key held down presses again on each auto-repeat, like a physical
 * keyboard.
 *
 * @param options - The keys of the shortcut and what a press does.
 * @returns Whether the shortcut is held down, until a key is released or the window loses focus.
 */
export function useKeyboardShortcut({
  keys = NO_KEYS,
  onPress
}: UseKeyboardShortcutParams = {}): boolean {
  const [isPressed, setIsPressed] = useState(false);

  // An effect event reads the latest keys and onPress, so the listeners are added only once.
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!isShortcutPress({ event, keys })) {
      return;
    }

    event.preventDefault();
    setIsPressed(true);
    onPress?.();
  });

  useEffect(() => {
    const pressKey = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };
    const releaseKey = () => {
      setIsPressed(false);
    };

    document.addEventListener('keydown', pressKey);
    document.addEventListener('keyup', releaseKey);
    window.addEventListener('blur', releaseKey);

    return () => {
      document.removeEventListener('keydown', pressKey);
      document.removeEventListener('keyup', releaseKey);
      window.removeEventListener('blur', releaseKey);
    };
  }, []);

  return isPressed;
}
