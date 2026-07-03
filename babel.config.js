module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    // react-native-worklets/plugin must run last (reanimated v4 delegates worklet transforms to it).
    plugins: ['react-native-worklets/plugin'],
  };
};
