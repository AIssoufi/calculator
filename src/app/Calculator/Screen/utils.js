import { MIN_TEXT_LENGTH, TEXT_LENGTH_PROPERTY } from './constants';

/**
 * Builds the inline style that gives `Screen.css` the length of the text to show, which shrinks
 * the font of a long number so it fits the screen.
 *
 * @param {unknown} text - Text of the screen; anything other than a string counts as empty.
 * @returns {Record<string, number>} The style, whose {@link TEXT_LENGTH_PROPERTY} is the length of
 * the text, {@link MIN_TEXT_LENGTH} at least.
 * @example getTextLengthStyle('-12.5') // { '--screen-text-length': 5 }
 */
export const getTextLengthStyle = text => {
    const length = typeof text === 'string' ? text.length : 0;

    return { [TEXT_LENGTH_PROPERTY]: Math.max(length, MIN_TEXT_LENGTH) };
};
