const $ = require ('sanctuary-def')
const {create, env} = require('sanctuary')

const checkTypes = process.env.NODE_ENV !== 'production'
const S = create({checkTypes, env})
const def = $.create({checkTypes, env: $.env})

const Lazy = (packageName, packageURL) => (name, type) => $.NullaryType(
  `${packageName}/${name}`,
  `${packageURL}#${name}`,
  x => $.test($.env, type(), x)
)

const Enum = (packageName, packageURL) => (name, values) => $.EnumType(
  `${packageName}/${name}`,
  `${packageURL}#${name}`,
  values
)

const Union = (packageName, packageURL) => (name, types) => $.NullaryType(
  `${packageName}/${name}`,
  `${packageURL}#${name}`,
  S.anyPass(types.map(type => x => $.test($.env, type, x)))
)

module.exports = {
  $, S, def,
  Lazy, Enum, Union
}
