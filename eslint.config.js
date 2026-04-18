// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] }, // Base JS rules
  js.configs.recommended,
  tseslint.configs.strict, // TypeScript
  sonarjs.configs.recommended, // SonarJS
  eslintReact.configs['recommended-typescript'], // React
  jsxA11y.flatConfigs.strict, // Accessibility
  prettier, // Relaxed rules for data files
  storybook.configs['flat/recommended'], // Storybook
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    rules: {
      // React hooks
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript — relax some strict defaults for game code
      '@typescript-eslint/no-explicit-any': 'warn', // we use `any` for JSON casts
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // Disable sonarjs duplicate of @typescript-eslint/no-unused-vars (which already ignores _-prefixed vars)
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/todo-tag': 'off',
      'sonarjs/no-commented-code': 'off',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'object-shorthand': 'error',
      'no-duplicate-imports': 'error',
      'prettier/prettier': 'error',
    },
  },
);
