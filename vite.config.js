import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Vitest runs the `*.spec.js` and `*.spec.jsx` files of `src/`, next to the code they cover, in
 * jsdom. The tests of the commit tooling, under `scripts/`, use the Node.js test runner instead
 * (see the `test` script). The globals (`describe`, `it`, `expect`, `vi`) let Testing Library
 * clean the DOM up after each test.
 */
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.spec.{js,jsx}'],
        setupFiles: ['./src/setupTests.js']
    }
});
