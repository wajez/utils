const {$, S} = require('../sanctuary')
const {_, Enum, Union} = require('./meta')

const MongooseModel = _({
    modelName: $.String,
    schema: _({
      obj: $.Object,
    }),
})

module.exports = {MongooseModel}
