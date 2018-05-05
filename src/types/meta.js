const {$, Lazy, Enum, Union} = require('../sanctuary')

const packageName = 'wajez/utils'
const packageURL  = 'https://github.com/wajez/utils/blob/master/types.md'

module.exports = {
  _: $.RecordType,
  Lazy: Lazy(packageName, packageURL),
  Enum: Enum(packageName, packageURL),
  Union: Union(packageName, packageURL),
}
