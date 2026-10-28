import { defineConfig, devices } from '@playwright/test';

/** Port of `vite preview`: its default, unless a non-empty `E2E_PORT` gives a free one. */
const PORT = process.env.E2E_PORT || '4173';

/** Address of the app served by `vite preview`. */
const BASE_URL = `http://localhost:${PORT}/`;

/**
 * Playwright runs the smoke tests of `e2e/` in Chromium, against the production build served by
 * `vite preview`, which it builds and starts before the tests and stops after them. A port already
 * taken fails the run, rather than testing whatever app answers on it. On the CI, a `test.only`
 * left in a spec fails the run too.
 */
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  use: {
    baseURL: BASE_URL
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: BASE_URL
  }
});
