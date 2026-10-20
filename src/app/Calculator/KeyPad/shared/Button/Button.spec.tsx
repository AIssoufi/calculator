import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from './Button';

const KEY_SELECTOR = '.btn';
const LARGE_KEY_CLASS = 'btn-large';

const getKey = (label: string) => screen.getByText(label, { selector: KEY_SELECTOR });

describe('Button', () => {
  it('passes its label to onClick when it is pressed', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} label="7" />);

    fireEvent.click(getKey('7'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith('7');
  });

  it('does nothing, without throwing, when it is pressed without onClick', () => {
    render(<Button label="7" />);

    expect(() => fireEvent.click(getKey('7'))).not.toThrow();
  });

  it('renders an empty regular key that does nothing when pressed with no props', () => {
    const { container } = render(<Button />);
    const key = container.querySelector(KEY_SELECTOR);
    assert(key, 'the key is rendered');

    expect(key).toBeEmptyDOMElement();
    expect(key).not.toHaveClass(LARGE_KEY_CLASS);
    expect(() => fireEvent.click(key)).not.toThrow();
  });

  it('passes an empty label to onClick when it has no label', () => {
    const onClick = vi.fn();
    const { container } = render(<Button onClick={onClick} />);
    const key = container.querySelector(KEY_SELECTOR);
    assert(key, 'the key is rendered');

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
