/* global __dirname, module, process, require */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

// Expo detects the pnpm workspace and watches the monorepo root automatically.
const config = getDefaultConfig(__dirname);

// Workspace packages (`@deck-legacy/*`) export their TypeScript sources under the `source`
// condition, so Metro bundles them directly without a build step.
config.resolver.unstable_conditionNames = [
  ...(config.resolver.unstable_conditionNames ?? []),
  'source',
];

module.exports = withStorybook(withNativeWind(config, { input: './src/styles/global.css' }), {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: './.rnstorybook',
});
