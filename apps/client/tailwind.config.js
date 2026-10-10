/* global module, require */
/**
 * Design tokens. Themed colors (`background`, `ink`, `border`, `primary`) are CSS variables
 * declared in `src/styles/global.css` and switched by the `dark` class (see GameUIProvider).
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    // Tag colour classes are built by the engine (`tagClass`, `tagTextClass`).
    '../../packages/engine/src/application/cardHelpers.ts',
    './stories/**/*.{ts,tsx}',
    './.rnstorybook/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      white: '#ffffff',
      black: '#000000',
      background: 'rgb(var(--color-background) / <alpha-value>)',
      ink: 'rgb(var(--color-ink) / <alpha-value>)',
      border: 'rgb(var(--color-border) / <alpha-value>)',
      primary: 'rgb(var(--color-primary) / <alpha-value>)',
      'base-ink': '#664a26',
      'base-primary': '#c79233',
      'dark-background': '#3b342a',
      'dark-ink': '#fff2e0',
      'dark-border': '#65553c',
      'dark-primary': '#ffd07c',
      card: '#f0e4be',
      gray: '#d1d5dc',
      permanent: '#27272a',
      danger: '#c2554f',
      success: '#00b286',
      'tag-enemy': '#c10007',
      'tag-building': '#62748e',
      'tag-person': '#f0b100',
      'tag-seafaring': '#00a6f4',
      'tag-land': '#00c950',
      'tag-livestock': '#ff6900',
      'tag-tag': '#ffa2a2',
    },
    extend: {
      fontFamily: {
        display: ['Cinzel_600SemiBold'],
        deco: ['CinzelDecorative_700Bold'],
        body: ['EBGaramond_400Regular'],
        'body-italic': ['EBGaramond_400Regular_Italic'],
        'body-bold': ['EBGaramond_700Bold'],
      },
    },
  },
  plugins: [],
};
