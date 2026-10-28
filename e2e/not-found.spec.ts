import { expect, test } from '@playwright/test';
import { VIEWPORTS } from './constants';

// The page that Cloudflare Pages serves, with a 404 status, for every path that matches no file of
// the build. `vite preview` has no such fallback, so the tests open the file itself.
const NOT_FOUND_PATH = '/404.html';

// The built page, and an unknown path a few levels deep at which Pages would serve it. A relative
// path in the page, `../` included, would resolve inside the unknown folders, where `vite preview`
// answers a missing file with `index.html` and a 200, so the test looks at the paths requested,
// not at their status.
const BUILT_NOT_FOUND_FILE = 'build/404.html';
const UNKNOWN_ROOT_FOLDER = '/a/';
const NESTED_UNKNOWN_PATH = `${UNKNOWN_ROOT_FOLDER}b/c`;

// The background image of the page, shared with the calculator.
const BACKGROUND_IMAGE_PATH = '/images/bg.jpg';

test('is built, in French, and kept out of search results', async ({ page }) => {
  const response = await page.goto(NOT_FOUND_PATH);

  expect(response?.ok(), `${NOT_FOUND_PATH} is in the build`).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable');
});

test('leads back to the calculator', async ({ page }) => {
  await page.goto(NOT_FOUND_PATH);

  const homeLink = page.getByRole('link', { name: 'Retour à la calculatrice' });

  await expect(homeLink).toHaveAttribute('href', '/');

  await homeLink.click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('status')).toBeVisible();
});

test('loads its files from the root at a nested unknown path', async ({ page }) => {
  const requestedPaths: string[] = [];

  await page.route(`**${NESTED_UNKNOWN_PATH}`, route =>
    route.fulfill({ status: 404, path: BUILT_NOT_FOUND_FILE })
  );
  page.on('request', request => requestedPaths.push(new URL(request.url()).pathname));

  await page.goto(NESTED_UNKNOWN_PATH, { waitUntil: 'load' });

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable');

  // Headless Chromium requests no favicon, so the paths of the links count as well.
  const linkedPaths = await page
    .locator('[href]')
    .evaluateAll(links =>
      links.map(link => new URL(link.getAttribute('href') ?? '', document.baseURI).pathname)
    );
  const filePaths = [
    ...requestedPaths.filter(requestedPath => requestedPath !== NESTED_UNKNOWN_PATH),
    ...linkedPaths
  ];
  const pathsInUnknownFolders = filePaths.filter(filePath =>
    filePath.startsWith(UNKNOWN_ROOT_FOLDER)
  );

  expect(filePaths, 'the background image is loaded').toContain(BACKGROUND_IMAGE_PATH);
  expect(pathsInUnknownFolders, 'the files requested relative to the page').toEqual([]);
});

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test('fits the viewport', async ({ page }) => {
      await page.goto(NOT_FOUND_PATH);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

      expect(scrollWidth, 'the page width').toBeLessThanOrEqual(viewport.width);
      await expect(page.getByRole('link')).toBeInViewport({ ratio: 1 });
    });
  });
}
