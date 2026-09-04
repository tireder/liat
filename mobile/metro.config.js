// Metro config – the app lives inside the web repo. Block the parent project's
// node_modules so Metro never picks up a second React / React Native copy,
// while keeping Expo's default resolution for everything inside mobile/.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const parentNodeModules = path.resolve(__dirname, '..', 'node_modules');
const escaped = parentNodeModules.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\\/g, '[\\\\/]');

config.resolver.blockList = [
    ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : config.resolver.blockList ? [config.resolver.blockList] : []),
    new RegExp(`^${escaped}[\\\\/].*`),
];
config.watchFolders = [__dirname];

module.exports = config;
