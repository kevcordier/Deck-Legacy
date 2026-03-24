import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },

  // Base JS rules
  js.configs.recommended,

  // TypeScript
  ...tseslint.configs.recommended,

  // React
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks':    reactHooks,
      'react-refresh':  reactRefresh,
      'prettier':       prettierPlugin,
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
      '@typescript-eslint/no-explicit-any':         'warn',   // we use `any` for JSON casts
      '@typescript-eslint/no-unused-vars':           ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion':    'warn',
      '@typescript-eslint/consistent-type-imports':  ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],

      // General
      'no-console':          ['warn', { allow: ['warn', 'error'] }],
      'prefer-const':        'error',
      'no-var':              'error',
      'eqeqeq':             ['error', 'always'],
      'object-shorthand':    'error',
      'no-duplicate-imports':'error',
      'prettier/prettier':   'error',
    },
  },

  // Prettier — must be last to override formatting rules
  prettier,

  // Relaxed rules for data files
  {
    files: ['src/engine/init.ts', 'src/engine/reducer.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)