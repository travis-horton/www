// ESLint flat config — replaces .eslintrc.js + eslint-config-airbnb (26.0917).
//
// The rule set is deliberately small: things that catch bugs (core recommended,
// react, react-hooks, jsx-a11y, typescript-eslint recommended) and nothing that
// legislates taste. Formatting is Prettier's job; eslint-config-prettier goes
// last and switches off every rule that would fight it.
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: [
      'dist/**',
      '.parcel-cache/**',
      'node_modules/**',
      'coverage/**',
      // Git submodules (.gitmodules) — each is its own repo, linted there.
      'src/pages/Programming/projects/asteroids/**',
      'src/pages/Programming/projects/orbitz/**',
      'src/pages/Programming/projects/perlin-noise/**',
      'src/pages/Programming/projects/polygon-race/**',
      'src/pages/Programming/projects/ray-tracer/**',
      'src/pages/Programming/projects/seximal_clock/**',
      // The Zig backend — not JavaScript.
      'api/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  // React 17+ automatic runtime: no `import React` needed for JSX.
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,

  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // No prop-types package in this project; types live in TS where they matter.
      'react/prop-types': 'off',
      // Apostrophes in blog prose are not a bug. The rule exists for stray `>` and `}`.
      'react/no-unescaped-entities': 'off',
      // jest's babel-jest still uses the classic JSX runtime, so `import React`
      // stays in every JSX file even though Parcel does not need it.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^React$', argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      // New React-Compiler-era rules (react-hooks v7). Real findings — the two
      // drills set state inside an effect — but warnings until they are refactored.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },

  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '__mocks__/**', 'jest.polyfills.js'],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
  },
  {
    // CommonJS files jest loads directly.
    files: ['__mocks__/**', 'jest.polyfills.js'],
    languageOptions: { sourceType: 'commonjs' },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      // jest.polyfills.js deliberately shadows TextEncoder/TextDecoder with node's.
      'no-redeclare': 'off',
    },
  },

  // Must be last: turns off every formatting rule Prettier owns.
  prettier,
]);
