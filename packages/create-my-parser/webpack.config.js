const a = require('@rabbitcc/webpack-builder').default([
  ['nodelib', { script: { jsx: true } }]
],{ 
  mode: process.env.NODE_ENV, 
  installOnCheckFail: true, 
  nodelib: { script: { jsx: true }}, 
  script: { jsx: true } 
})
  // .setEntryName('main', require('./package.json').name)
  // .setProd('output.path', require('path').resolve(__dirname, 'dist'))
  /* .set('output.filename', '[name]') */
  /* .setPlugin('banner', require('webpack').BannerPlugin, {
    banner: '#!/usr/bin/env node\n',
    raw: true,
    entryOnly: true
  }) */
  /* .setRuleLoader('txt', 'raw-loader')
  .setRuleLoader('yaml', 'json-loader')
  .setRuleLoader('yaml', 'yaml-loader') */
  .deletePlugin('script/compressor')
  /* .setPlugin('declaration', 'declaration-bundler-webpack-plugin', {
    moduleName: 'create-my-core',
    out: './dist/index.d.ts'
  }) */
  .print()
  .transform()

  a.module.rules[0].use[0].options = {}

  module.exports = a