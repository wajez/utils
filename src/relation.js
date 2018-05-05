const {$, def, S} = require('./sanctuary')
const T = require('./types')

const relation = def('relation', {}, [T.RelationType, $.String, $.Nullable($.String), $.String, $.Nullable($.String), T.Relation],
  (type, sourceName, sourceField, targetName, targetField) => ({
    type,
    source: {
      name: sourceName,
      field: sourceField
    },
    target: {
      name: targetName,
      field: targetField
    }
  })
)

const oneOne = relation('one-one')
const oneMany = relation('one-many')
const manyMany = relation('many-many')

module.exports = {relation, oneOne, oneMany, manyMany}
