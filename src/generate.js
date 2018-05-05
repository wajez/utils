const chance  = new (require('chance'))
const {randexp} = require('randexp')
const escapeStringRegexp = require('escape-string-regexp')
const {$, def, S} = require('./sanctuary')
const T = require('./types')

const string = def('generateString', {}, [T.StringSchema, $.String],
  ({choices, match, minLength, maxLength}) => {
    if (choices)
      match = choices.map(escapeStringRegexp).join('|')
    if (match)
      return randexp(match)
    const length = chance.integer({min: minLength, max: maxLength})
    return chance.string({length})
  }
)

const number = def('generateNumber', {}, [T.NumberSchema, $.Number],
  ({min, max}) => chance.floating({min, max})
)

const boolean = def('generateBoolean', {}, [T.BooleanSchema, $.Boolean],
  () => chance.bool()
)

const date = def('generateDate', {}, [T.DateSchema, $.Date],
  ({min, max}) => {
    if (! min) {
      min = new Date()
      min.setFullYear(min.getFullYear() - 1)
    }
    if (! max) {
      max = new Date()
      max.setFullYear(max.getFullYear() + 1)
    }

    min = Math.floor(min.getTime() / 1000)
    max = Math.floor(max.getTime() / 1000)

    return new Date(1000 * chance.integer({min, max}))
  }
)

const buffer = def('generateBuffer', {}, [T.BufferSchema, $.Any],
  () => Buffer.from(chance.string())
)

const object = def('generateObject', {}, [T.ObjectSchema, $.Any],
  ({fields}) => {
    const result = {}
    for(const name in fields)
      result[name] = generate(fields[name])()
    return result
  }
)

const array = def('generateArray', {}, [T.ArraySchema, $.Array($.Any)],
  ({schema, minLength, maxLength}) => {
    const length = chance.integer({min: minLength, max: maxLength})
      , items = []
      , get = generate(schema)
    if (get() == null)
      return []
    let i = 0
    while (i < length) {
      items.push(get())
      i ++
    }
    return items
  }
)

const generate = schema => () =>
  (schema.type === 'date') ? date(schema) :
  (schema.type === 'array') ? array(schema) :
  (schema.type === 'string') ? string(schema) :
  (schema.type === 'number') ? number(schema) :
  (schema.type === 'buffer') ? buffer(schema) :
  (schema.type === 'object') ? object(schema) :
  (schema.type === 'boolean') ? boolean(schema) :
  null

module.exports = {generate}
