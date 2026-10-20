import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { setupStore } from '../store';
import Calculator from './Calculator';

const CALCULATOR_SELECTOR = '.main_wrapper';
const RESULT_SELECTOR = '.result';
const KEY_SELECTOR = '.btn';
const SOCIAL_LINKS_SELECTOR = '.social-links';

const renderCalculator = () => render(
  <Provider store={setupStore()}>
    <Calculator />
  </Provider>
);

describe('Calculator', () => {
  it('renders the screen and the keypad inside the calculator', () => {
    const { container } = renderCalculator();
    const calculator = container.querySelector(CALCULATOR_SELECTOR);

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
    expect(calculator.compareDocumentPosition(socialLinks))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
