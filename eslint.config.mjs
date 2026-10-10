// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/coverage',
      '**/storybook-static',
      '**/dev-dist',
      // Tooling configs (CommonJS)
      '**/*.{js,cjs}',
      '**/.expo',
      'apps/client/.rnstorybook/storybook.requires.ts',
      'apps/server/src/generated',
    ],
  }, // Base JS rules
  js.configs.recommended,
  tseslint.configs.strict, // TypeScript
  sonarjs.configs.recommended, // SonarJS
  eslintReact.configs['recommended-typescript'], // React
  prettier, // Relaxed rules for data files
  storybook.configs['flat/recommended'], // Storybook
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, __DEV__: 'readonly' },
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // React hooks
      ...reactHooks.configs.recommended.rules,

      // TypeScript — relax some strict defaults for game code
      '@typescript-eslint/no-explicit-any': 'warn', // we use `any` for JSON casts
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // Disable sonarjs duplicate of @typescript-eslint/no-unused-vars (which already ignores _-prefixed vars)
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/todo-tag': 'off',
      'sonarjs/no-commented-code': 'off',

      // General
      'max-params': ['error', 7],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'object-shorthand': 'error',
      'no-duplicate-imports': 'error',
      'prettier/prettier': 'error',
    },
  },
  {
    // Node.js code: the API server, shared packages and tooling configs
    files: [
      'apps/server/**/*.ts',
      'packages/**/*.ts',
      '**/*.config.{ts,mts}',
      'scripts/**/*.mjs',
      'apps/*/scripts/**/*.mjs',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // NestJS modules are empty classes carrying a decorator.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      // `useFactory`, `useValue`… are NestJS provider keys, not React hooks.
      '@eslint-react/no-unnecessary-use-prefix': 'off',
    },
  },
);
