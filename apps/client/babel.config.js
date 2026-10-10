/* global module */
module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo already registers the react-native-worklets plugin (Reanimated 4).
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // Inline Markdown files (game rules) as raw strings at build time.
      ['inline-import', { extensions: ['.md'] }],
    ],
  };
};
