# Data Types

## Schema

A schema is used to describe the structure of data. It can be one of:

### StringSchema

```js
{
  type :: 'string'
  choices: Array String | Null,
  match: RegExp | Null,
  minLength: Number,
  maxLength: Number
}
```

### NumberSchema

```js
{
  type: 'number'
  min: Number,
  max: Number
}
```

### BooleanSchema

```js
{
  type: 'boolean'
}
```

### BufferSchema

```js
{
  type: 'buffer'
}
```

### DateSchema

```js
{
  type: 'date',
  min: Date || Null,
  max: Date || Null
}
```

### ArraySchema

```js
{
  type: 'array',
  minLength: Number,
  maxLength: Number,
  schema: Schema
}
```

### ObjectSchema

```js
{
  type: 'object',
  fields: StrMap Schema
}
```

### UniqueSchema

```js
{
  type: 'unique',
  schema: Schema
}
```

## MongooseModel

Represents a [mongoose](http://mongoosejs.com/) model.

## RelationType

One of `'one-one'`  `'one-many'`  `'many-many'`.

## Relation

```js
{
  type: RelationType,
  source: {
    name: String,
    field: String || Null,
  },
  target:  {
    name: String,
    field: String || Null,
  }
}
```

