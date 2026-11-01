import { expect, test, type Page } from '@playwright/test';
import { VIEWPORTS } from './constants';

// The example of "How it computes" in the README: evaluated from left to right, it gives 20.
const TYPED_KEYS = '2+3*4=';
const EXPECTED_RESULT = '20';

// A classic calculator test: plain JavaScript numbers leave 5.55e-17 when values cancel out.
const CANCELLING_KEYS = '0.1+0.2-0.3=';
const CANCELLING_RESULT = '0';

// Accessible names of the buttons that enter the same calculation with the mouse.
const CLICKED_KEY_NAMES = ['2', '+', '3', 'Multiplier', '4', '='];

// Keys of the keypad: 11 on the number pad, 5 on the operator pad and 3 on the function pad.
const KEY_COUNT = 19;

// Opens the app and waits until React has rendered the screen, right after which the keys attach
// their keydown listeners in an effect: a key typed before them would be lost (see #36). Returns
// the screen.
const openCalculator = async (page: Page) => {
  await page.goto('/');

  const calculatorScreen = page.getByRole('status');

  await expect(calculatorScreen).toBeVisible();

  return calculatorScreen;
};

test('computes with the keyboard', async ({ page }) => {
  const calculatorScreen = await openCalculator(page);

  await page.keyboard.type(TYPED_KEYS);

  await expect(calculatorScreen).toHaveText(EXPECTED_RESULT);
});

test('shows 0 when close decimal values cancel out', async ({ page }) => {
  const calculatorScreen = await openCalculator(page);

  await page.keyboard.type(CANCELLING_KEYS);

  await expect(calculatorScreen).toHaveText(CANCELLING_RESULT);
});

test('computes with the mouse', async ({ page }) => {
  const calculatorScreen = await openCalculator(page);

  for (const name of CLICKED_KEY_NAMES) {
    await page.getByRole('button', { name, exact: true }).click();
  }

  await expect(calculatorScreen).toHaveText(EXPECTED_RESULT);
});

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test('shows every key inside the viewport', async ({ page }) => {
      await openCalculator(page);

      const keys = page.getByRole('button');

      await expect(keys).toHaveCount(KEY_COUNT);

      for (const key of await keys.all()) {
        const label = await key.textContent();

        await expect(key, `the key ${label}`).toBeInViewport({ ratio: 1 });
      }
    });
  });
}
