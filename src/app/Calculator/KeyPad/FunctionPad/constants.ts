/** Clear key that resets everything: its label, and its name read by screen readers. */
export const ALL_CLEAR_KEY = { label: 'AC', name: 'AC, tout effacer' } as const;

/**
 * Clear key while there is an entry. Its name, like the one of {@link ALL_CLEAR_KEY}, starts with
 * the label so that a voice command can say it.
 */
export const CLEAR_ENTRY_KEY = { label: 'C', name: 'C, effacer la saisie' } as const;

/** Name of the `+/-` key read by screen readers. */
export const TOGGLE_SIGN_NAME = 'Changer de signe';

/** Keys that press the clear key, which clears the entry first, then everything. */
export const CLEAR_SHORTCUTS = ['Escape', 'Backspace'];

/** Key that presses the percent key. */
export const PERCENT_SHORTCUTS = ['%'];
