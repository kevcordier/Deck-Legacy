// Polyfills first: the engine uses globals missing from Hermes (e.g. crypto.randomUUID).
import './src/polyfills';
import { registerRootComponent } from 'expo';

/* eslint-disable @typescript-eslint/no-require-imports -- the entry is chosen at startup */
// `pnpm storybook` sets EXPO_PUBLIC_STORYBOOK_ENABLED to render Storybook instead of the game.
// When it is not set, metro's withStorybook() strips Storybook from the bundle.
if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true') {
  registerRootComponent(require('./.rnstorybook').default);
} else {
  // Pages are the routes of `src/app` (expo-router).
  require('expo-router/entry');
}
