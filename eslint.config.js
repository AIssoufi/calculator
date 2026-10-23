import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** TypeScript files of the app, the specs included. */
const APP_FILES = ['src/**/*.{ts,tsx}'];

/** TypeScript files of the smoke tests of the production build. */
const E2E_FILES = ['e2e/**/*.ts'];

/**
 * ESLint checks the code of the repository: the recommended rules everywhere, plus the
 * typescript-eslint rules for the app and its smoke tests, which are written in TypeScript, and the
 * React and Rules of Hooks rules for the app. The app runs in the browser; its specs also get the
 * Vitest globals. The smoke tests, which Playwright runs, and the configuration files and the
 * commit tooling, still in JavaScript, run in Node.js.
 */
export default [
    { ignores: ['build/'] },
    js.configs.recommended,
    ...tseslint.configs.recommended.map(config => ({
        ...config,
        files: [...APP_FILES, ...E2E_FILES]
    })),
    {
        files: APP_FILES,
        ...react.configs.flat.recommended,
        languageOptions: {
            ...react.configs.flat.recommended.languageOptions,
            globals: globals.browser
        },
        settings: { react: { version: 'detect' } }
    },
    {
        files: APP_FILES,
        ...react.configs.flat['jsx-runtime']
    },
    {
        files: APP_FILES,
        ...reactHooks.configs.flat.recommended
    },
    {
        files: APP_FILES,
        rules: {
            // The components declare no PropTypes: TypeScript checks their props.
            'react/prop-types': 'off'
        }
    },
    {
        files: ['src/**/*.spec.{ts,tsx}'],
        languageOptions: { globals: globals.vitest }
    },
    {
        files: [...E2E_FILES, '*.{js,mjs}', 'scripts/**/*.mjs'],
        languageOptions: { globals: globals.node }
    }
];
