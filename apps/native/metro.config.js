const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

const fs = require('fs');
const rootNodeModules = path.join(workspaceRoot, 'node_modules');

config.watchFolders = [
  path.join(workspaceRoot, 'packages', 'shared'),
  ...(fs.existsSync(rootNodeModules) ? [rootNodeModules] : []),
];

config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  ...(fs.existsSync(rootNodeModules) ? [rootNodeModules] : []),
];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  '@dosebase/shared': path.join(workspaceRoot, 'packages', 'shared'),
};

module.exports = config;

