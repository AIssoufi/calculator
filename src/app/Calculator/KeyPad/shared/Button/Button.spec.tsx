import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

const LARGE_KEY_CLASS = 'btn-large';
const PRESSED_KEY_CLASS = 'btn-pressed';

const getKey = (name: string) => screen.getByRole('button', { name });

describe('Button', () => {
  it('is a native button that does not submit a form', () => {
    render(<Button label="7" />);

    expect(getKey('7')).toHaveAttribute('type', 'button');
  });

  it('passes its label to onClick when it is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick} label="7" />);

    await user.click(getKey('7'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith('7');
  });

  it.each(['{Enter}', ' '])('is pressed with %j once it has the focus', async key => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick} label="7" />);

    await user.tab();
    await user.keyboard(key);

    expect(getKey('7')).toHaveFocus();
    expect(onClick).toHaveBeenCalledWith('7');
  });

  it('gives the focus back to the page after a pointer click', async () => {
    const user = userEvent.setup();
    render(<Button label="7" />);

    await user.click(getKey('7'));

    expect(getKey('7')).not.toHaveFocus();
  });

  it('is named by ariaLabel rather than by its symbol, which it still shows', () => {
    render(<Button label="X" ariaLabel="Multiplier" />);

    expect(getKey('Multiplier')).toHaveTextContent('X');
  });

  it('passes its label to onClick, and shows it pressed, while a shortcut key is held', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick} label="=" shortcuts={['=', 'Enter']} />);

    await user.keyboard('{Enter>}');

    expect(onClick).toHaveBeenCalledWith('=');
    expect(getKey('=')).toHaveClass(PRESSED_KEY_CLASS);

    await user.keyboard('{/Enter}');

    expect(getKey('=')).not.toHaveClass(PRESSED_KEY_CLASS);
  });

  it('is not pressed by a key that is not one of its shortcuts', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick} label="7" shortcuts={['7']} />);

    await user.keyboard('8');

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does nothing, without throwing, when it is pressed without onClick', () => {
    render(<Button label="7" shortcuts={['7']} />);

    expect(() => fireEvent.click(getKey('7'))).not.toThrow();
    expect(() => fireEvent.keyDown(document.body, { key: '7' })).not.toThrow();
  });

  it('renders an empty regular key that does nothing when pressed with no props', () => {
    render(<Button />);
    const key = screen.getByRole('button');

    expect(key).toBeEmptyDOMElement();
    expect(key).not.toHaveClass(LARGE_KEY_CLASS);
    expect(key).not.toHaveClass(PRESSED_KEY_CLASS);
    expect(() => fireEvent.click(key)).not.toThrow();
  });

  it('passes an empty label to onClick when it has no label', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} />);
    const key = screen.getByRole('button');

    expect(key).toBeEmptyDOMElement();

    fireEvent.click(key);

    expect(onClick).toHaveBeenCalledWith('');
  });

  it('is a regular key by default', () => {
    render(<Button label="1" />);

    expect(getKey('1')).not.toHaveClass(LARGE_KEY_CLASS);
  });

  it('is a large key when isLarge is set', () => {
    render(<Button label="0" isLarge />);

    expect(getKey('0')).toHaveClass(LARGE_KEY_CLASS);
  });
});
