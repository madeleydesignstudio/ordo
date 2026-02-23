// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { addLiveStoreDevtoolsMiddleware } = require('@livestore/devtools-expo')
const path = require('node:path')
const { withUniwindConfig } = require('uniwind/metro'); 

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Needed for monorepo setup (can be removed in standalone projects)
if (process.env.MONOREPO_ROOT) {
  config.watchFolders = [path.resolve(process.env.MONOREPO_ROOT)]
}

module.exports = withUniwindConfig(config, {  
  // relative path to your global.css file (from previous step)
  cssEntryFile: './src/global.css',
  // (optional) path where we gonna auto-generate typings
  // defaults to project's root
  dtsFile: './src/uniwind-types.d.ts'
});

addLiveStoreDevtoolsMiddleware(config, {
  schemaPath: './src/livestore/schema.ts',
  viteConfig: (viteConfig) => {
    viteConfig.server.fs ??= {}
    viteConfig.server.fs.strict = false
    viteConfig.optimizeDeps ??= {}
    viteConfig.optimizeDeps.force = true
    return viteConfig
  },
})

