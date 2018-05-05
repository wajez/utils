const {$, S} = require('../sanctuary')

const packageName = 'wajez/utils'
const packageURL  = 'https://github.com/wajez/utils/blob/master/types.md'

const _ = $.RecordType

const Lazy = (name, type) => $.NullaryType(
  `${packageName}/${name}`,
  `${packageURL}#${name}`,
  x => $.test($.env, type(), x)
)

const Enum = (name, values) => $.EnumType(
  `${packageName}/${name}`,
  `${packageURL}#${name}`,
  values
)

const Union = (name, types) => $.NullaryType(
  `${packageName}/${name}`,
  `${packageURL}#${name}`,
  S.anyPass(types.map(type => x => $.test($.env, type, x)))
)

module.exports = {_, Lazy, Enum, Union}
