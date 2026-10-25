import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import App from './App';
import { setupStore } from '../store';

// Labels of the keys in the order Tab reaches them: function keys, digits row by row, operators.
const KEY_LABELS = [
  'AC', '+/-', '%',
  '7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.',
  '/', 'X', '—', '+', '='
];

// Accessible names of the keys whose label is a symbol that screen readers misread.
const KEY_NAMES: Record<string, string> = {
  'AC': 'AC, tout effacer',
  'C': 'C, effacer la saisie',
  '+/-': 'Changer de signe',
  '/': 'Diviser',
  'X': 'Multiplier',
  '—': 'Moins'
};

// Sets user-event up before the render, as its docs advise, and returns it with the render result.
const renderApp = () => ({
  user: userEvent.setup(),
  ...render(
    <Provider store={setupStore()}>
      <App />
    </Provider>
  )
});

const getKey = (label: string) => screen.getByRole('button', { name: KEY_NAMES[label] ?? label });

const getScreen = () => screen.getByRole('status');

describe('App', () => {
  it('has a heading for screen readers', () => {
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: 'Calculatrice' })).toBeInTheDocument();
  });

  it('renders the screen showing 0', () => {
    renderApp();

    expect(getScreen()).toHaveTextContent(/^0$/);
  });

  it.each(KEY_LABELS)('renders the %s key of the keypad, showing its label', label => {
    renderApp();

    expect(getKey(label)).toHaveTextContent(label);
  });

  it('reaches every key with Tab, in reading order, before the author links', async () => {
    const { user } = renderApp();

    for (const label of KEY_LABELS) {
      await user.tab();

      expect(getKey(label)).toHaveFocus();
    }

    await user.tab();

    expect(screen.getByRole('link', { name: 'Adam Issoufi' })).toHaveFocus();
  });

  it('shows the pressed digits on the screen', async () => {
    const { user } = renderApp();

    await user.click(getKey('7'));
    await user.click(getKey('3'));

    expect(getScreen()).toHaveTextContent(/^73$/);
  });

  it('turns AC into C after a digit, and C brings the screen back to 0', async () => {
    const { user } = renderApp();

    await user.click(getKey('7'));
    await user.click(getKey('C'));

    expect(getScreen()).toHaveTextContent(/^0$/);
    expect(getKey('AC')).toBeInTheDocument();
  });

  // Labels of the keys to click, separated by spaces: `X` multiplies and `—` subtracts.
  it.each([
    ['5 =', '5'],
    ['2 + 3 + 4 =', '9'],
    ['2 + 3 X 4 =', '20'],
    ['2 + 3 +', '5'],
    ['0 — 5 — 1 =', '-6'],
    ['5 X 0 + 2 =', '2'],
    // After `=` the clear key reads C, and AC once the result is cleared.
    ['9 — 3 = C AC 5 =', '5'],
    ['2 + 3 = 7 + 1 =', '8'],
    ['2 + 3 = 4 =', '4'],
    ['1 . 0 5', '1.05'],
    ['0 . 0 5', '0.05'],
    ['1 . 2 . 3', '1.23'],
    ['5 + 1 . =', '6'],
    ['6 / 0 =', 'Erreur'],
    ['0 . 1 + 0 . 2 =', '0.3'],
    ['+/- 5', '-5'],
    ['2 + 3 C 4 =', '6'],
    ['5 0 %', '0.5']
  ])('shows %j as %j on the screen', async (sequence, expected) => {
    const { user } = renderApp();

    for (const label of sequence.split(' ')) {
      await user.click(getKey(label));
    }

    expect(getScreen().textContent).toBe(expected);
  });

  // Keys typed with user-event: `{Enter}`, `{Escape}` and `{Backspace}` name the special keys.
  it.each([
    ['5=', '5'],
    ['2+3+4{Enter}', '9'],
    ['2+3*4=', '20'],
    ['0-5-1{Enter}', '-6'],
    // Escape presses the clear key, which clears the result, then everything.
    ['9-3={Escape}{Escape}5=', '5'],
    ['2+3{Backspace}4=', '6'],
    ['1,05', '1.05'],
    ['0.1+0.2=', '0.3'],
    ['6/0{Enter}', 'Erreur'],
    ['50%', '0.5'],
    // Ctrl and `-` zooms out in the browser, so it subtracts nothing.
    ['8{Control>}-{/Control}2', '82']
  ])('shows %j typed on the keyboard as %j on the screen', async (keys, expected) => {
    const { user } = renderApp();

    await user.keyboard(keys);

    expect(getScreen().textContent).toBe(expected);
  });

  it('shows a key pressed while its keyboard shortcut is held', async () => {
    const { user } = renderApp();

    await user.keyboard('{7>}');

    expect(getKey('7')).toHaveClass('btn-pressed');

    await user.keyboard('{/7}');

    expect(getKey('7')).not.toHaveClass('btn-pressed');
  });

  it('presses the focused key with Enter, such as +/-, which has no shortcut', async () => {
    const { user } = renderApp();

    await user.keyboard('5');
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(getKey('+/-')).toHaveFocus();
    expect(getScreen()).toHaveTextContent(/^-5$/);
  });

  it('presses = with Enter after a key is clicked, since the click gives the focus back', async () => {
    const { user } = renderApp();

    await user.keyboard('2+');
    await user.click(getKey('3'));
    await user.keyboard('{Enter}');

    expect(getScreen()).toHaveTextContent(/^5$/);
  });
});
