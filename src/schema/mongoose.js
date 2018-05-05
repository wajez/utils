const {Schema} = require('mongoose')
const {$, def, S} = require('../sanctuary')
const T = require('../types')
const {merge, mapObj} = require('../lib')
const {
  string, number, boolean, date, buffer,
  object, array, reference, unknown
} = require('./basic')

const field = def('field', {}, [$.Any, T.Schema],
  value =>
    (value == undefined) ? unknown() :
    (value === String || value.type === String) ? string(value.type != undefined ? merge(value, {choices: value.enum}) : {}) :
    (value === Number || value.type === Number) ? number(value.type != undefined ? value : {}) :
    (value === Date || value.type === Date) ? date(value.type != undefined ? value : {}) :
    (value === Boolean || value.type === Boolean) ? boolean() :
    (value === Buffer || value.type === Buffer) ? buffer() :
    (value.type === Schema.Types.ObjectId) ? (value.ref !== undefined ? reference(value.ref) : unknown()) :
    (value.constructor === Array && value.length > 0) ? array(field(value[0]), {}) :
    (value === Object || value.type === Object) ? object({}) :
    S.is(Object, value) ? object(mapObj(field, value)) :
    unknown()
)

const model = def('model', {}, [T.MongooseModel, T.Schema],
    model => object(mapObj(field, model.schema.obj))
)

module.exports = {model}
