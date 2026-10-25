import { render, screen, within } from '@testing-library/react';

import { Author } from './Author';

/** The accessible name and the target of each link of the author block. */
const AUTHOR_LINKS = [
  ['Adam Issoufi', 'https://www.issoufi.fr'],
  ['Code source sur GitHub', 'https://github.com/AIssoufi/calculatrice'],
  ["Profil LinkedIn d'Adam Issoufi", 'https://www.linkedin.com/in/issoufiadam'],
  ['React', 'https://reactjs.org'],
  ['Redux', 'https://redux.js.org']
];

describe('Author', () => {
  it.each(AUTHOR_LINKS)('names the link to %s for screen readers', (name, href) => {
    render(<Author />);

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
  });

  it.each(AUTHOR_LINKS)('puts the link to %s in the contentinfo landmark', name => {
    render(<Author />);
    const footer = screen.getByRole('contentinfo');

    expect(within(footer).getByRole('link', { name })).toBeInTheDocument();
  });

  it('hides the icons of the links from screen readers', () => {
    const { container } = render(<Author />);
    const icons = Array.from(container.querySelectorAll('svg'));

    expect(icons).not.toHaveLength(0);
    icons.forEach(icon => expect(icon).toHaveAttribute('aria-hidden', 'true'));
  });
});
