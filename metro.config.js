const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add support for image files
config.resolver.assetExts.push("jpg", "jpeg", "png", "gif", "webp", "svg");

module.exports = withNativeWind(config, { input: "./global.css" });
