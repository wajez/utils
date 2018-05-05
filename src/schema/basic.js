const {$, def, S} = require('../sanctuary')
const T = require('../types')

const string = ({choices, match, minLength, maxLength} = {}) => ({
  type:      'string',
  choices:   choices   || null,
  match:     match   || null,
  minLength: minLength || 0,
  maxLength: maxLength || 100
})

const number = ({min, max} = {}) => ({
  type: 'number',
  min:  (min !== undefined) ? min : -100,
  max:  (max !== undefined) ? max : 100
})

const _boolean = {type: 'boolean'}
const boolean = () => _boolean

const date = ({min, max} = {}) => ({
  type: 'date',
  min:  min || null,
  max:  max || null
})

const _buffer = {type: 'buffer'}
const buffer = () => _buffer

const object = fields => ({
  type: 'object',
  fields: fields || {}
})

const array = (schema, {minLength, maxLength} = {}) => ({
  type: 'array',
  schema: schema || object(),
  minLength: minLength || 0,
  maxLength: maxLength || 100
})

const reference = name => ({
  type: 'reference',
  name
})

const _unknown = {type: 'unknown'}
const unknown = () => _unknown

module.exports = {
  string,
  number,
  boolean,
  date,
  buffer,
  object,
  array,
  reference,
  unknown,
}
