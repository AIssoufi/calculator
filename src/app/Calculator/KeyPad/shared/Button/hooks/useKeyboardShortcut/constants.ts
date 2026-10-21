/** Key that also activates the focused button or link, which then keeps its native behavior. */
export const ACTIVATION_KEY = 'Enter';

/** Elements that the {@link ACTIVATION_KEY} activates when they have the focus. */
export const ACTIVATABLE_SELECTOR = 'a[href], button';

/** Keys of a key with no keyboard shortcut. */
export const NO_KEYS: readonly string[] = Object.freeze([]);
