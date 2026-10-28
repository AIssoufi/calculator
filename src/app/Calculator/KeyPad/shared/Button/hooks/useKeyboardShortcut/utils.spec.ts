import { isShortcutPress } from './utils';

const KEYS = ['=', 'Enter'];

// Dispatches a keydown on the target, so the event gets it, and returns the event.
const pressOn = (target: EventTarget, init: KeyboardEventInit) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, ...init });
  target.dispatchEvent(event);
  return event;
};

describe('isShortcutPress', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each(['=', 'Enter'])('is true for the %s key of the shortcut pressed on the page', key => {
    expect(isShortcutPress({ event: pressOn(document.body, { key }), keys: KEYS })).toBe(true);
  });

  it('is true with Shift, which types some symbols', () => {
    const event = pressOn(document.body, { key: '=', shiftKey: true });

    expect(isShortcutPress({ event, keys: KEYS })).toBe(true);
  });

  it.each(['=', 'Escape', 'a', 'Unidentified', ''])(
    'is false for the %j key when the shortcut has none',
    key => {
      expect(isShortcutPress({ event: pressOn(document.body, { key }), keys: ['+'] })).toBe(false);
    }
  );

  it('is false for any key when the shortcut has no keys', () => {
    expect(isShortcutPress({ event: pressOn(document.body, { key: '=' }), keys: [] })).toBe(false);
  });

  it.each(['ctrlKey', 'metaKey', 'altKey'])(
    'is false when %s is held, for a browser shortcut',
    modifier => {
      const event = pressOn(document.body, { key: '=', [modifier]: true });

      expect(isShortcutPress({ event, keys: KEYS })).toBe(false);
    }
  );

  it.each([
    ['a button', '<button type="button">7</button>', 'button'],
    ['a link', '<a href="https://example.com">site</a>', 'a'],
    ['the icon of a link', '<a href="https://example.com"><svg></svg></a>', 'svg']
  ])('is false for Enter on %s, which Enter activates', (_name, html, selector) => {
    document.body.innerHTML = html;
    const target = document.querySelector(selector);
    assert(target, 'the target is rendered');

    expect(isShortcutPress({ event: pressOn(target, { key: 'Enter' }), keys: KEYS })).toBe(false);
  });

  it('is true for another key of the shortcut on a focused button', () => {
    document.body.innerHTML = '<button type="button">7</button>';
    const button = document.querySelector('button');
    assert(button, 'the button is rendered');

    expect(isShortcutPress({ event: pressOn(button, { key: '=' }), keys: KEYS })).toBe(true);
  });

  it('is true for Enter on an element that Enter does not activate, such as a link without href', () => {
    document.body.innerHTML = '<a>text</a>';
    const link = document.querySelector('a');
    assert(link, 'the link is rendered');

    expect(isShortcutPress({ event: pressOn(link, { key: 'Enter' }), keys: KEYS })).toBe(true);
  });

  it('is true for Enter on an event that was never dispatched, so has no target', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });

    expect(isShortcutPress({ event, keys: KEYS })).toBe(true);
  });
});
