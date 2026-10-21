import { act, fireEvent, renderHook } from '@testing-library/react';

import { useKeyboardShortcut } from './useKeyboardShortcut';

const KEYS = ['=', 'Enter'];

describe('useKeyboardShortcut', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onPress and shows the shortcut pressed while one of its keys is held', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useKeyboardShortcut({ keys: KEYS, onPress }));

    expect(result.current).toBe(false);

    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(true);

    fireEvent.keyUp(document.body, { key: 'Enter' });

    expect(result.current).toBe(false);
  });

  it('prevents the browser action of a shortcut key, and only of a shortcut key', () => {
    renderHook(() => useKeyboardShortcut({ keys: KEYS }));

    expect(fireEvent.keyDown(document.body, { key: '=' })).toBe(false);
    expect(fireEvent.keyDown(document.body, { key: '/' })).toBe(true);
  });

  it('presses again on each auto-repeat of a held key, like a physical keyboard', () => {
    const onPress = vi.fn();
    renderHook(() => useKeyboardShortcut({ keys: KEYS, onPress }));

    fireEvent.keyDown(document.body, { key: '=' });
    fireEvent.keyDown(document.body, { key: '=', repeat: true });

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('ignores the other keys', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useKeyboardShortcut({ keys: KEYS, onPress }));

    fireEvent.keyDown(document.body, { key: '7' });

    expect(onPress).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it('ignores a key combined with Ctrl, such as the zoom of Ctrl and =', () => {
    const onPress = vi.fn();
    renderHook(() => useKeyboardShortcut({ keys: KEYS, onPress }));

    fireEvent.keyDown(document.body, { key: '=', ctrlKey: true });

    expect(onPress).not.toHaveBeenCalled();
  });

  it('releases the shortcut when another key, such as Shift, is released first', () => {
    const { result } = renderHook(() => useKeyboardShortcut({ keys: ['%'] }));

    fireEvent.keyDown(document.body, { key: '%', shiftKey: true });
    fireEvent.keyUp(document.body, { key: 'Shift' });

    expect(result.current).toBe(false);
  });

  it('releases the shortcut when the window loses the focus before the key is released', () => {
    const { result } = renderHook(() => useKeyboardShortcut({ keys: KEYS }));

    fireEvent.keyDown(document.body, { key: '=' });
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current).toBe(false);
  });

  it('calls the latest onPress and keys after a render, without adding listeners again', () => {
    const firstOnPress = vi.fn();
    const latestOnPress = vi.fn();
    const addListener = vi.spyOn(document, 'addEventListener');
    const { rerender } = renderHook(
      ({ keys, onPress }) => useKeyboardShortcut({ keys, onPress }),
      { initialProps: { keys: ['1'], onPress: firstOnPress } }
    );
    const listenerCount = addListener.mock.calls.length;

    rerender({ keys: ['2'], onPress: latestOnPress });
    fireEvent.keyDown(document.body, { key: '1' });
    fireEvent.keyDown(document.body, { key: '2' });

    expect(addListener).toHaveBeenCalledTimes(listenerCount);
    expect(firstOnPress).not.toHaveBeenCalled();
    expect(latestOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows a press, without throwing, when it has no onPress', () => {
    const { result } = renderHook(() => useKeyboardShortcut({ keys: KEYS }));

    expect(() => fireEvent.keyDown(document.body, { key: '=' })).not.toThrow();
    expect(result.current).toBe(true);
  });

  it('listens to no key when it gets no options', () => {
    const { result } = renderHook(() => useKeyboardShortcut());

    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(result.current).toBe(false);
  });

  it('removes its three listeners when it unmounts', () => {
    const onPress = vi.fn();
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const removeWindowListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyboardShortcut({ keys: KEYS, onPress }));

    unmount();
    fireEvent.keyDown(document.body, { key: '=' });

    expect(onPress).not.toHaveBeenCalled();
    expect(removeDocumentListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeDocumentListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(removeWindowListener).toHaveBeenCalledWith('blur', expect.any(Function));
  });
});
