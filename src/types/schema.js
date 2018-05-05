const {$, S} = require('../sanctuary')
const {_, Lazy, Enum, Union} = require('./meta')

const LazySchema = Lazy('Schema', () => Schema)

const StringSchema = _({
  type: Enum('StringSchemaType', ['string']),
  choices: $.Nullable($.Array($.String)),
  match: $.Nullable($.RegExp),
  minLength: $.Number,
  maxLength: $.Number,
})

const NumberSchema = _({
  type: Enum('NumberSchemaType', ['number']),
  min: $.Number,
  max: $.Number,
})

const BooleanSchema = _({
  type: Enum('BooleanSchemaType', ['boolean']),
})

const DateSchema = _({
  type: Enum('DateSchemaType', ['date']),
  min: $.Nullable($.Date),
  max: $.Nullable($.Date),
})

const BufferSchema = _({
  type: Enum('BufferSchemaType', ['buffer']),
})

const ObjectSchema = _({
  type: Enum('ObjectSchemaType', ['object']),
  fields: $.StrMap(LazySchema)
})

const ArraySchema = _({
  type: Enum('ArraySchemaType', ['array']),
  schema: LazySchema,
  minLength: $.Number,
  maxLength: $.Number,
})

const ReferenceSchema = _({
  type: Enum('ReferenceSchemaType', ['reference']),
  name: $.String,
})

const UnknownSchema = _({
  type: Enum('UnknownSchemaType', ['unknown'])
})

const Schema = Union('Schema', [
  StringSchema,
  NumberSchema,
  BooleanSchema,
  DateSchema,
  BufferSchema,
  ObjectSchema,
  ArraySchema,
  ReferenceSchema,
  UnknownSchema
])

module.exports = {
  StringSchema,
  NumberSchema,
  BooleanSchema,
  DateSchema,
  BufferSchema,
  ObjectSchema,
  ArraySchema,
  ReferenceSchema,
  UnknownSchema,
  Schema,
}
