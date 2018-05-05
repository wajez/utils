const assert = require('chai').assert
const mongoose = require('mongoose')
const {model} = require('../src')

describe('Schema', () => {
  describe('model', () => {
    it('gets schema of string fields', () => {
      assert.deepEqual(model(mongoose.model('SchemaTest1', new mongoose.Schema({
        name: String,
        genre: {
          type: String,
          enum: ['M', 'F']
        },
        email: {
          type: String,
          match: /[a-z0-9._+-]{1,20}@[a-z0-9]{3,15}\.[a-z]{2,4}/
        },
        password: {
          type: String,
          minLength: 8
        }
      }))), {
        type: 'object',
        fields: {
          name: {
            type: 'string',
            choices: null,
            match: null,
            minLength: 0,
            maxLength: 100
          },
          genre: {
            type: 'string',
            choices: ['M', 'F'],
            match: null,
            minLength: 0,
            maxLength: 100
          },
          email: {
            type: 'string',
            choices: null,
            match: /[a-z0-9._+-]{1,20}@[a-z0-9]{3,15}\.[a-z]{2,4}/,
            minLength: 0,
            maxLength: 100
          },
          password: {
            type: 'string',
            choices: null,
            match: null,
            minLength: 8,
            maxLength: 100
          }
        }
      })
    })

    it('gets schema of number fields', () => {
      assert.deepEqual(model(mongoose.model('SchemaTest2', new mongoose.Schema({
        n1: Number,
        n2: {
          type: Number,
          min: 3
        },
        n3: {
          type: Number,
          max: 3
        },
      }))), {
        type: 'object',
        fields: {

          n1: {
            type: 'number',
            min: -100,
            max: 100
          },
          n2: {
            type: 'number',
            min: 3,
            max: 100
          },
          n3: {
            type: 'number',
            min: -100,
            max: 3
          },
        }
      })
    })

    it('gets schema of boolean fields', () => {
      assert.deepEqual(model(mongoose.model('SchemaTest3', new mongoose.Schema({
        b1: Boolean,
        b2: {
          type: Boolean
        },
      }))), {
        type: 'object',
        fields: {
          b1: {
            type: 'boolean',
          },
          b2: {
            type: 'boolean',
          },
        }
      })
    })

    it('gets schema of buffer fields', () => {
      assert.deepEqual(model(mongoose.model('SchemaTest4', new mongoose.Schema({
        b1: Buffer,
        b2: {
          type: Buffer
        },
      }))), {
        type: 'object',
        fields: {
          b1: {
            type: 'buffer',
          },
          b2: {
            type: 'buffer',
          },
        }
      })
    })

    it('gets schema of date fields', () => {
      const now = new Date()
      assert.deepEqual(model(mongoose.model('SchemaTest5', new mongoose.Schema({
        d1: Date,
        d2: {
          type: Date,
          min: now
        },
        d3: {
          type: Date,
          max: now
        },
      }))), {
        type: 'object',
        fields: {
          d1: {
            type: 'date',
            min: null,
            max: null
          },
          d2: {
            type: 'date',
            min: now,
            max: null
          },
          d3: {
            type: 'date',
            min: null,
            max: now
          },
        }
      })
    })

    it('gets schema of object fields', () => {
      assert.deepEqual(model(mongoose.model('SchemaTest6', new mongoose.Schema({
        foo: Object,
        bestFriend: {
          name: String,
          pet: {
            name: String,
            type: {
              type: String,
              enum: ['dog', 'cat']
            }
          }
        }
      }))), {
        type: 'object',
        fields: {
          foo: {
            type: 'object',
            fields: {}
          },
          bestFriend: {
            type: 'object',
            fields: {
              name: {
                type: 'string',
                choices: null,
                match: null,
                minLength: 0,
                maxLength: 100
              },
              pet: {
                type: 'object',
                fields: {
                  name: {
                    type: 'string',
                    choices: null,
                    match: null,
                    minLength: 0,
                    maxLength: 100
                  },
                  type: {
                    type: 'string',
                    choices: ['dog', 'cat'],
                    match: null,
                    minLength: 0,
                    maxLength: 100
                  }
                }
              }
            }
          },
        }
      })
    })

    it('gets schema of array fields', () => {
      assert.deepEqual(model(mongoose.model('SchemaTest7', new mongoose.Schema({
        scores: [Number],
        matrix: [[Boolean]],
        projects: [{
          name: String,
          language: {
            type: String,
            enum: ['JS', 'PHP', 'C++']
          }
        }]
      }))), {
        type: 'object',
        fields: {
          scores: {
            type: 'array',
            schema: {
              type: 'number',
              min: -100,
              max: 100
            },
            minLength: 0,
            maxLength: 100
          },
          matrix: {
            type: 'array',
            schema: {
              type: 'array',
              schema: {
                type: 'boolean',
              },
              minLength: 0,
              maxLength: 100
            },
            minLength: 0,
            maxLength: 100
          },
          projects: {
            type: 'array',
            schema: {
              type: 'object',
              fields: {
                name: {
                  type: 'string',
                  choices: null,
                  match: null,
                  minLength: 0,
                  maxLength: 100
                },
                language: {
                  type: 'string',
                  choices: ['JS', 'PHP', 'C++'],
                  match: null,
                  minLength: 0,
                  maxLength: 100
                }
              }
            },
            minLength: 0,
            maxLength: 100
          },
        }
      })
    })

    it('gets schema of ref fields', () => {
      assert.deepEqual(model(mongoose.model('SchemaTest8', new mongoose.Schema({
        unknown: mongoose.Schema.Types.ObjectId,
        anything: mongoose.Schema.Types.Mixed,
        parent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User3',
        },
        friends: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User8',
        }],
      }))), {
        type: 'object',
        fields: {
          unknown: {
            type: 'unknown'
          },
          anything: {
            type: 'unknown'
          },
          parent: {
            type: 'reference',
            name: 'User3'
          },
          friends: {
            type: 'array',
            minLength: 0,
            maxLength: 100,
            schema: {
              type: 'reference',
              name: 'User8'
            }
          },
        }
      })
    })
  })
})
