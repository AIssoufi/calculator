import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Vite serves and builds the app from `index.html`. The build goes to `build/`, the output folder
 * of the Cloudflare Pages project, and its page loads the assets with relative paths, so it works
 * from the root of any domain, previews included.
 *
 * Vitest runs the `*.spec.js` and `*.spec.jsx` files of `src/`, next to the code they cover, in
 * jsdom. The tests of the commit tooling, under `scripts/`, use the Node.js test runner instead
 * (see the `test` script). The globals (`describe`, `it`, `expect`, `vi`) let Testing Library
 * clean the DOM up after each test.
 */
export default defineConfig({
    base: './',
    build: {
        outDir: 'build'
    },
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.spec.{js,jsx}'],
        setupFiles: ['./src/setupTests.js']
    }
});
