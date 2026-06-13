const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

config.resolver.sourceExts.push('cjs')

const withNativeWindConfig = withNativeWind(config, { input: './global.css' })

// Inject DOMException polyfill at the very start of the bundle —
// before React Native's own polyfills and before any module factories run.
const defaultGetPolyfills = withNativeWindConfig.serializer?.getPolyfills
withNativeWindConfig.serializer = {
  ...withNativeWindConfig.serializer,
  getPolyfills: (opts) => [
    require.resolve('./polyfill-dom-exception.js'),
    ...(defaultGetPolyfills ? defaultGetPolyfills(opts) : []),
  ],
}

module.exports = withNativeWindConfig
