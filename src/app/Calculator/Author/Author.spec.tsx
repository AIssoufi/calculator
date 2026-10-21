import { render, screen } from '@testing-library/react';

import { Author } from './Author';

describe('Author', () => {
  it.each([
    ['Adam Issoufi', 'https://www.issoufi.fr'],
    ['Code source sur GitHub', 'https://github.com/AIssoufi/calculatrice'],
    ["Profil LinkedIn d'Adam Issoufi", 'https://www.linkedin.com/in/issoufiadam'],
    ['React', 'https://reactjs.org'],
    ['Redux', 'https://redux.js.org']
  ])('names the link to %s for screen readers', (name, href) => {
    render(<Author />);

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
  });

  it('hides the icons of the links from screen readers', () => {
    const { container } = render(<Author />);
    const icons = Array.from(container.querySelectorAll('svg'));

    expect(icons).not.toHaveLength(0);
    icons.forEach(icon => expect(icon).toHaveAttribute('aria-hidden', 'true'));
  });
});
