import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * ESLint checks the JavaScript of the repository: the recommended rules everywhere, plus the
 * React and Rules of Hooks rules for the app. The app runs in the browser; the specs also get the
 * Vitest globals, and the configuration files and the commit tooling run in Node.js.
 */
export default [
    { ignores: ['build/'] },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx}'],
        ...react.configs.flat.recommended,
        languageOptions: {
            ...react.configs.flat.recommended.languageOptions,
            globals: globals.browser
        },
        settings: { react: { version: 'detect' } }
    },
    {
        files: ['src/**/*.{js,jsx}'],
        ...react.configs.flat['jsx-runtime']
    },
    {
        files: ['src/**/*.{js,jsx}'],
        ...reactHooks.configs.flat.recommended
    },
    {
        files: ['src/**/*.{js,jsx}'],
        rules: {
            // The components declare no PropTypes since #10; TypeScript will type their props (#5).
            'react/prop-types': 'off'
        }
    },
    {
        files: ['src/**/*.spec.{js,jsx}'],
        languageOptions: { globals: globals.vitest }
    },
    {
        files: ['*.{js,mjs}', 'scripts/**/*.mjs'],
        languageOptions: { globals: globals.node }
    }
];
