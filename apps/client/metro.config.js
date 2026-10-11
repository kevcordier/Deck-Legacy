/* global __dirname, module, process, require */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
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

// `.md` files are inlined by babel-plugin-inline-import, which Metro's cache does not track:
// hash them into the cache key so edited rules are rebundled (on the next Metro start).
const localesDir = path.join(__dirname, 'src/data/locales');
const mdHash = crypto.createHash('sha1');
for (const file of fs
  .readdirSync(localesDir)
  .filter(f => f.endsWith('.md'))
  .sort()) {
  mdHash.update(fs.readFileSync(path.join(localesDir, file)));
}
config.cacheVersion = `${config.cacheVersion ?? ''}-md-${mdHash.digest('hex')}`;

module.exports = withStorybook(withNativeWind(config, { input: './src/styles/global.css' }), {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: './.rnstorybook',
});
