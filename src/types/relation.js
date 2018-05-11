const {$, S} = require('../sanctuary')
const {_, Enum, Union} = require('./meta')

const RelationType = Enum('RelationType', ['one-one', 'one-many', 'many-one', 'many-many'])

const Relation = _({
  type: RelationType,
  source: _({
    name: $.String,
    field: $.Nullable($.String),
  }),
  target: _({
    name: $.String,
    field: $.Nullable($.String),
  })
})

module.exports = {Relation, RelationType}
