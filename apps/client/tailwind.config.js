/* global module, require */
/**
 * Design tokens. Page colors (`background`, `ink`, `border`, `primary`) are CSS variables
 * declared in `src/presentation/styles/global.css`; the app has a single (dark) theme.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    // Tag colour classes are built by the engine (`tagClass`, `tagBorderClass`).
    '../../packages/engine/src/domain/cards/tagClass.ts',
    '../../packages/engine/src/domain/cards/tagBorderClass.ts',
    './stories/**/*.{ts,tsx}',
    './.rnstorybook/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  // NativeWind web throws at startup with the default 'media' mode; no `dark` class is ever set.
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
      'ink-card': '#664a26',
      'base-primary': '#c79233',
      card: '#f0e4be',
      gray: '#d1d5dc',
      permanent: '#71717a',
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
