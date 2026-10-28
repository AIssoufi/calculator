import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';

import { setupStore } from '../store';
import Calculator from './Calculator';

const CALCULATOR_SELECTOR = '.main_wrapper';
const RESULT_SELECTOR = '.result';
const KEY_SELECTOR = '.btn';
const SOCIAL_LINKS_SELECTOR = '.social-links';
// Class of `src/index.css` that hides an element from the eye but keeps it for screen readers.
const VISUALLY_HIDDEN_CLASS = 'visually-hidden';

const renderCalculator = () =>
  render(
    <Provider store={setupStore()}>
      <Calculator />
    </Provider>
  );

describe('Calculator', () => {
  it('renders the calculator as the only main landmark of the page', () => {
    const { container } = renderCalculator();

    expect(screen.getByRole('main')).toBe(container.querySelector(CALCULATOR_SELECTOR));
  });

  it('renders the heading of the page as the first child of the main landmark', () => {
    renderCalculator();
    const calculator = screen.getByRole('main');
    const heading = within(calculator).getByRole('heading', { level: 1, name: 'Calculatrice' });

    expect(calculator.firstElementChild).toBe(heading);
  });

  it('hides the heading from the eye, for screen readers only', () => {
    renderCalculator();

    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(VISUALLY_HIDDEN_CLASS);
  });

  it('renders the screen and the keypad inside the calculator', () => {
    renderCalculator();
    const calculator = screen.getByRole('main');

    expect(calculator).toContainElement(screen.getByText('0', { selector: RESULT_SELECTOR }));
    expect(calculator).toContainElement(screen.getByText('=', { selector: KEY_SELECTOR }));
  });

  it('renders the author links after the calculator, outside it, so they never cover a key', () => {
    const { container } = renderCalculator();
    const calculator = container.querySelector<HTMLElement>(CALCULATOR_SELECTOR);
    const socialLinks = container.querySelector<HTMLElement>(SOCIAL_LINKS_SELECTOR);
    assert(calculator && socialLinks, 'the calculator and the author links are rendered');

    expect(socialLinks).toBeInTheDocument();
    expect(calculator).not.toContainElement(socialLinks);
    expect(calculator.compareDocumentPosition(socialLinks)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
