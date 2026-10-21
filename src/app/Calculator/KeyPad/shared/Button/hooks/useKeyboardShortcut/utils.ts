import { ACTIVATABLE_SELECTOR, ACTIVATION_KEY } from './constants';

/** Arguments of {@link isShortcutPress}. */
interface IsShortcutPressParams {
  /** The `keydown` event to check. */
  event: KeyboardEvent;
  /** Values of `KeyboardEvent.key` that make up the shortcut. */
  keys: readonly string[];
}

/**
 * Tells whether an element is a button or a link that the {@link ACTIVATION_KEY} activates.
 *
 * @param target - Target of a keyboard event; anything other than an element is not one.
 * @returns Whether the target is, or is inside, an activatable element.
 */
const isActivatable = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest(ACTIVATABLE_SELECTOR) !== null;

/**
 * Tells whether a `keydown` event presses a keyboard shortcut. A key combined with Ctrl, Meta or
 * Alt is a browser or system shortcut, such as Ctrl and `-` to zoom out, so it presses nothing;
 * Shift is allowed, since it types `%` or `+` on many layouts. The {@link ACTIVATION_KEY} pressed
 * on a focused button or link activates that element instead.
 *
 * @param options - The event and the keys of the shortcut.
 * @returns Whether the event presses the shortcut.
 * @example isShortcutPress({ event: new KeyboardEvent('keydown', { key: '7' }), keys: ['7'] }) // true
 */
export const isShortcutPress = ({ event, keys }: IsShortcutPressParams): boolean => {
  const isShortcutKey = keys.includes(event.key);
  const hasCommandModifier = event.ctrlKey || event.metaKey || event.altKey;
  const activatesFocusedElement = event.key === ACTIVATION_KEY && isActivatable(event.target);

  return isShortcutKey && !hasCommandModifier && !activatesFocusedElement;
};
