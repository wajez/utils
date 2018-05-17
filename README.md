# Wajez Utils

[![Build Status](https://travis-ci.org/wajez/utils.svg?branch=master)](https://travis-ci.org/wajez/utils)
[![Coverage Status](https://coveralls.io/repos/github/wajez/utils/badge.svg)](https://coveralls.io/github/wajez/utils)
[![Join the chat at https://gitter.im/wajez/utils](https://badges.gitter.im/wajez/utils.svg)](https://gitter.im/wajez/utils?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://github.com/wajez/utils/blob/master/LICENSE)

A bunch of handy functions used to build other Wajez packages.

# Contents

- [Installation](#installation)

- [Generating Random Data](#generating-random-data)

- [Generating Mongoose Model](#generating-mongoose-model)

- [Seeding a Mongoose Database](#seeding-a-mongoose-database)

- [Converting Data](#converting-data)

  - [Full Example](#full-example)

  - [Converter can be a Function](#converter-can-be-a-function)

  - [Converter can be an Object](#converter-can-be-an-object)

  - [Converter maps over Arrays](#converter-maps-over-arrays)

  - [An Array of converters is a converter](#an-array-of-converters-is-a-converter)

  - [Converters are recursive](#converters-are-recursive)

- [Contributing](#contributing)


# Installation

```
yarn add wajez-utils
```
or
```
npm i --save wajez-utils
```

# Generating Random Data

```
generate :: Schema -> (() -> *)
```

The function `generate` takes a `Schema` and returns a function which when called will return some random data based on the given schema.

Schemas can be defined using the following functions:

```
string :: {minLength: Number, maxLength: Number, match: Regex, choices: [String]} -> Schema
number :: {min: Number, max: Number} -> Schema
boolean :: () -> Schema
buffer :: () -> Schema
date :: {min: Date, max: Date} -> Schema
array :: {schema: Schema, minLength: Number, maxLangth: Number} -> Schema
object :: {*: Schema} -> Schema
```

Here are some examples:

```js
const U = require('wajez-utils')

// Generate Strings
const anyString = U.generate(U.string())
const yesOrNo = U.generate(U.string({choices: ['yes', 'no']}))
const email = U.generate(U.string({match: /[a-z0-9._+-]{1,20}@[a-z0-9]{3,15}\.[a-z]{2,4}/}))
const lessThen20Chars = U.generate(U.string({maxLength: 20}))

console.log(anyString())
// @RAJPF1y#FqM%!U(8ESsnr@PMM*c03NN^GRFwPY6*hhWNuwf
console.log(yesOrNo())
// no
console.log(email())
// h8mtue4vwr9@1nop1vu72qg.spjm
console.log(email())
// fbv46d8d_xvdg6@upuc.cf
console.log(lessThen20Chars())
// ^CRYr@bP

// Generate Numbers
const anyNumber = U.generate(U.number())
const rating = U.generate(U.number({min: 1, max: 5}))

console.log(anyNumber())
// -460.3763
console.log(rating())
// 4.6537

// Generate Booleans
const anyBoolean = U.generate(U.boolean())
console.log(anyBoolean())
// true
console.log(anyBoolean())
// false

// Generate Dates
const anyDate = U.generate(U.date())
const inTheFuture = U.generate(U.date({min: new Date()}))

console.log(anyDate())
// 2018-10-11T02:09:58.000Z
console.log(inTheFuture())
// 2018-10-31T01:46:48.000Z

// Generate Buffers
const anyBuffer = U.generate(U.buffer())
console.log(anyBuffer())
// <Buffer 4d 6f 26 40 69 29 26 4c 77 28 44 58 52 23 74>

// Generate Objects & Arrays
const person = U.object({
  name: U.string({maxLength: 50}),
  age: U.number({min: 0})
})

const project = U.object({
  name: U.string({maxLength: 25}),
  language: U.string({choices: ['javascript', 'c++', 'php', 'python']})
})

// schemas are composable!
const developer = U.object({
  ... person.fields,
  projects: U.array(project, {maxLength: 10})
})

const newDeveloper = U.generate(developer)

console.log(JSON.stringify(newDeveloper()))
// {
//   "name":"9dMK&KKg@&mKPHDr6L]Md6HL$jqGAA]Z",
//   "age":-741.6026,
//   "projects": [{
//     "name":"xZL2YPl9eW]dsKYOQZB",
//     "language":"python"
//   },{
//     "name":")jE&17",
//     "language":"php"
//   }]
// }
```


# Generating Mongoose Model

The schema of a mongoose model can be defined using the `model` function:

```
model :: MongooseModel -> Schema
```


```js
const mongoose = require('mongoose')
const {Schema} = mongoose
const U = require('wajez-utils')

const Username = {
  type: String,
  match: /[a-zA-Z0-9-_\.]{5,20}/
}

const User = mongoose.model('User', new Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 25,
    match: /^[a-z ]+$/
  },
  picture: Buffer,
  since: {
    type: Date,
    max: new Date()
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  links: {
    facebook: Username,
    twitter: Username,
    github: Username
  }
}))

const generateUser = U.generate(U.model(User))

console.log(generateUser())
// {
//   name: 'gwyvehx raxilunaetkwdzwdwcpwdrpqvp mwpbcxwpku',
//   picture: <Buffer 2a 42 78 71 55 57 38 31 79 30 34 49 39 4b 36 70>,
//   since: 2018-02-12T04:31:15.000Z,
//   rating: 1.9242,
//   links: {
//     facebook: 'VeBL6e-pU',
//     twitter: 'gKGLqLV',
//     github: 'vhIC6BDLvNf4MuHOj_'
//   }
// }
```

# Seeding a Mongoose Database

The function `seed` can be used to fill a mongodb database with random data based on `mongoose` models.

```
seed :: {model1: Number, model2: Number, ...} -> [Relation] -> Promise(*)
```

The first argument of `seed` is an object associating each model name to the number of records to generate and insert. The second argument is an array of `relations`.

Relations can be defined using the functions `oneOne`, `oneMany` and `manyMany`.

```js
oneOne(sourceModel, sourceField, targetModel, targetField)
oneMany(sourceModel, sourceField, targetModel, targetField)
manyMany(sourceModel, sourceField, targetModel, targetField)
```

Here is a full example

```js
const mongoose = require('mongoose')
const {Schema} = mongoose
const {seed, oneOne, oneMany, manyMany} = require('./src')

mongoose.Promise = global.Promise
mongoose.connect(`mongodb://localhost/wajez-utils`)

const User = mongoose.model('User', new Schema({
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  },
  name: String
}))

const Profile = mongoose.model('Profile', new Schema({
  picture: Buffer
}))

const Post = mongoose.model('Post', new Schema({
  writer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  title: String,
  content: String
}))

const Tag = mongoose.model('Tag', new Schema({
  name: String,
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }]
}))

seed({
  User: 3,
  Profile: 3,
  Post: 5,
  Tag: 4
}, [
  oneOne('User', 'profile', 'Profile', null),
  oneMany('User', 'posts', 'Post', 'writer'),
  manyMany('Post', 'tags', 'Tag', 'posts')
])
.then(data => {
  console.log(JSON.stringify(data))
})

// {
//   "User": [
//     {
//       "posts": [
//         "5aed2cd384702a2207c3e2ed",
//         "5aed2cd384702a2207c3e2ee",
//         "5aed2cd384702a2207c3e2ef"
//       ],
//       "_id": "5aed2cd384702a2207c3e2e7",
//       "profile": "5aed2cd384702a2207c3e2ea",
//       "name": "7MthPn7WA)!3y@SjHigl]vFAK&xRo9FfsdMF)dK]#t#HiF@^s^wvFns",
//       "__v": 0
//     },
//     {
//       "posts": [
//         "5aed2cd384702a2207c3e2f0",
//         "5aed2cd384702a2207c3e2f1"
//       ],
//       "_id": "5aed2cd384702a2207c3e2e8",
//       "profile": "5aed2cd384702a2207c3e2eb",
//       "name": "B]([^8*k6padMySnAI1MS%FX^LoLXAHbE&S)OmXw",
//       "__v": 0
//     },
//     {
//       "posts": [],
//       "_id": "5aed2cd384702a2207c3e2e9",
//       "profile": "5aed2cd384702a2207c3e2ec",
//       "name": "!w3I84iTXYtSJdmVJX]c1[d6#*16nd1mqMiDP)g^&o6R053RnNcyxYr0c*5^X18St6RsquCAorFq)KlHWs",
//       "__v": 0
//     }
//   ],
//   "Profile": [
//     {
//       "_id": "5aed2cd384702a2207c3e2ea",
//       "picture": {
//         "type": "Buffer",
//         "data": [52, 53, 97, 105, 67, 114, 42, 99, 41, 118, 40, 38, 42, 35, 78]
//       },
//       "__v": 0
//     },
//     {
//       "_id": "5aed2cd384702a2207c3e2eb",
//       "picture": {
//         "type": "Buffer",
//         "data": [51, 98, 78, 33, 76, 86]
//       },
//       "__v": 0
//     },
//     {
//       "_id": "5aed2cd384702a2207c3e2ec",
//       "picture": {
//         "type": "Buffer",
//         "data": [69, 69, 48, 37, 66, 87, 33, 83, 93, 89, 38, 67, 82]
//       },
//       "__v": 0
//     }
//   ],
//   "Post": [
//     {
//       "tags": [
//         "5aed2cd384702a2207c3e2f2",
//         "5aed2cd384702a2207c3e2f4"
//       ],
//       "_id": "5aed2cd384702a2207c3e2ed",
//       "writer": "5aed2cd384702a2207c3e2e7",
//       "title": "3F]K8JQnIXsne(whhGn%U*YyrA0vC^pC%pxhKwGU]FAivdhDznMri*Ip&]HT1nY[%DpDegCoBW",
//       "content": "rp",
//       "__v": 0
//     },
//     {
//       "tags": [
//         "5aed2cd384702a2207c3e2f3",
//         "5aed2cd384702a2207c3e2f5"
//       ],
//       "_id": "5aed2cd384702a2207c3e2ee",
//       "writer": "5aed2cd384702a2207c3e2e7",
//       "title": "^8Nkp8B)JHu(YV0s**InJof@J!JGBhlYy6wuQCc#sb^d[K)C]b8jg)PnEDxF#[JFT#]ABT4x%vgWw8CWssemwvmODFSJVdd",
//       "content": "D3cdhdg)hO$@ydIx)T!!St1vy!BfYP1TK2A5$#$g*@o)Qk(xF78a8V5H(QdgokP08&A(mf*tmER6PzoNi(6CeXxn$W%V",
//       "__v": 0
//     },
//     {
//       "tags": [
//         "5aed2cd384702a2207c3e2f2",
//         "5aed2cd384702a2207c3e2f3"
//       ],
//       "_id": "5aed2cd384702a2207c3e2ef",
//       "writer": "5aed2cd384702a2207c3e2e7",
//       "title": "C[dbHT!DaP9KTi3qWpbWYLqIMzZOJE9p[](M0cNnDmnc7h%p#)vzcU%O%l2Dq8YIx0f5eLZe(vFFV#72k0dP6",
//       "content": "(#q#xY)osPBQOTb27h$jPYh[hq38lm37XO$ZZh&zb!zF!2^",
//       "__v": 0
//     },
//     {
//       "tags": [
//         "5aed2cd384702a2207c3e2f2",
//         "5aed2cd384702a2207c3e2f3",
//         "5aed2cd384702a2207c3e2f4"
//       ],
//       "_id": "5aed2cd384702a2207c3e2f0",
//       "writer": "5aed2cd384702a2207c3e2e8",
//       "title": "xGVK&Z%Pf%t@kkozDez[VTedKekVqdnHFj]JnuD@FbrW2R9dhLGIu(oShe9ngv]RY0sV4l!u&tXNh%S@Bl8n**)A0ArOblrEh",
//       "content": "tcNQ$I4oh#fqv2xrh]ioCMQKYB8eXI#IA9xuz4MVDi4*(HKhBe8SIWxTglIR[DAkwWB",
//       "__v": 0
//     },
//     {
//       "tags": [
//         "5aed2cd384702a2207c3e2f2",
//         "5aed2cd384702a2207c3e2f3",
//         "5aed2cd384702a2207c3e2f4"
//       ],
//       "_id": "5aed2cd384702a2207c3e2f1",
//       "writer": "5aed2cd384702a2207c3e2e8",
//       "title": "Lsfm!l)QzkeBUnKBnKgrQ4EpeEMPuT@1GRL$(x#2W]WgaS0TQsuuoIgVnJIa3lJIRFWoVXD(dNjn6fDQ0kvRc&1oEqm!09",
//       "content": "iN7J[oJh7TDI#&*XX6qK7no!9^OwcQdGlMzcjueDVKwQQrAJIIXENvgHHlx3gfLjo%)&btAqGfLJqz",
//       "__v": 0
//     }
//   ],
//   "Tag": [
//     {
//       "posts": [
//         "5aed2cd384702a2207c3e2ed",
//         "5aed2cd384702a2207c3e2ef",
//         "5aed2cd384702a2207c3e2f0",
//         "5aed2cd384702a2207c3e2f1"
//       ],
//       "_id": "5aed2cd384702a2207c3e2f2",
//       "name": "MhT4[w1cVzrNc(%cgJq%A*GknXU%[r7y%#vi$5MZqQTOwKgEAwno76HDoM5V",
//       "__v": 0
//     },
//     {
//       "posts": [
//         "5aed2cd384702a2207c3e2ee",
//         "5aed2cd384702a2207c3e2ef",
//         "5aed2cd384702a2207c3e2f0",
//         "5aed2cd384702a2207c3e2f1"
//       ],
//       "_id": "5aed2cd384702a2207c3e2f3",
//       "name": "BQl2c9ozL39^J$Re@H*ida&!5]V",
//       "__v": 0
//     },
//     {
//       "posts": [
//         "5aed2cd384702a2207c3e2ed",
//         "5aed2cd384702a2207c3e2f0",
//         "5aed2cd384702a2207c3e2f1"
//       ],
//       "_id": "5aed2cd384702a2207c3e2f4",
//       "name": "vgsHTSPoivaAb^)(vE!33G)P8CdHHeNUiA0DdY9a$JiOKHH!5YZCACC3Y&zHbr64xECMdGxf5]dPi[H",
//       "__v": 0
//     },
//     {
//       "posts": [
//         "5aed2cd384702a2207c3e2ee"
//       ],
//       "_id": "5aed2cd384702a2207c3e2f5",
//       "name": "f#(BSFM)Ez749b7IJW5wyyuu$jVgcMRd3NQ7OX0RYXTYoAy",
//       "__v": 0
//     }
//   ]
// }
```


# Converting Data

The function `applyConverter` can be used to apply a converter on data. A converter is an object which specifies what function to apply on each property of the given data.

We will start with a full example, then explain different ways to use `applyConverter`.

## Full Example
Let's assume I have the following user infos returned from database

```js
const user = {
  _id: 'xxxxxxx',
  _v: 1,
  username: 'webneat',
  password: 'myVerySecurePassword :P',
  profile: {
    _id: 'yyyyyyy',
    _v: 1,
    firstname: 'Amine',
    lastname: 'Ben hammou',
    picture: 'some-url',
  },
  repos: [
    'webNeat/lumen-generators',
    'tarsana/command',
    'wajez/api'
  ]
}
```

I want to transform it into something like this

```js
{
  username: 'webneat',
  fullName: 'Amine Ben hammou',
  picture: 'some-url',
  repos: [
    {
      name: 'lumen-generators',
      url: 'https://github.com/webNeat/lumen-generators'
    },
    {
      name: 'command',
      url: 'https://github.com/tarsana/command'
    },
    {
      name: 'api',
      url: 'https://github.com/wajez/api'
    }
  ]
}
```

I would simply do the following

```js
const {applyConverter, I} = require('./src')

const fullName = ({profile: {firstname, lastname}}) => firstname + ' ' + lastname
const repo = name => ({
  name: name.split('/')[1],
  url: `https://github.com/${name}`
})

const convert = applyConverter({
  username: I,
  fullName: fullName,
  picture: _ => _.profile.picture,
  repos: repo
})

console.log(convert(user))
// {
//   username: 'webneat',
//   fullName: 'Amine Ben hammou',
//   picture: 'some-url',
//   repos: [
//     { name: 'lumen-generators', url: 'https://github.com/webNeat/lumen-generators' },
//     { name: 'command', url: 'https://github.com/tarsana/command' },
//     { name: 'api', url: 'https://github.com/wajez/api' }
//   ]
// }

```

## Converter can be a Function

When given a `Function` as converter, `applyConverter` will simply apply that function on the value and return the result.

```js
applyConverter(x => x + 1, 5) // 6
```

## Converter can be an Object

When given an object of functions, it will try to apply each function to the corresponding attribute on the value.

```js
const addOne = _ => _ + 1
const triple = _ => _ * 3

const value = { x: 1, y: 2, z: 3 }

applyConverter({ x: triple, y: addOne }, value) // {x: 3, y: 3}
```

Note that since the key `z` is not mentioned in the converter, it's not included in the result.

## Converter maps over Arrays

When applying a converter to an array, it's applied to each item of the array

```js
const sum = ({x, y}) => x + y

const values = [
  { x: 1, y: 2 },
  { x: 3, y: 4 },
  { x: 5, y: 6 },
]

applyConverter({a: sum}, values) // [{a: 3}, {a: 7}, {a: 11}]
```

## An Array of converters is a converter

```js
const addOne = _ => _ + 1
const triple = _ => _ * 3
const sum = ({x, y}) => x + y

const value = {x: 1, y: 2}

applyConverter(
  [
    {x: addOne, y: triple},
    sum
  ],
  value
) // 8
```

## Converters are recursive

When defining a converter as object, are applied as converters, so they can be functions, objects of converters or array of converters.

```js

const value = {
  x: {
    a: 1,
    y: {
      z: 2
    }
  }
}

applyConverter({x: {y: {z: addOne}}}, value) // {x: {y: {z: 3}}}
```

# Contributing

Feel free to create issues and/or submit Pull Requests!
