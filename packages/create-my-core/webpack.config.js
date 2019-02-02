const a = require('@rabbitcc/webpack-builder').default([
  ['nodelib', { script: { jsx: true } }]
],{
  mode: process.env.NODE_ENV,
  installOnCheckFail: true,
  nodelib: { script: { jsx: true }},
  script: { jsx: true }
})
  .deletePlugin('script/compressor')
  .print()
  .transform()

  a.module.rules[0].use[0].options = {}

  module.exports = a
