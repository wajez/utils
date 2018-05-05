const mongoose = require('mongoose')
const {$, def, S} = require('./sanctuary')
const T = require('./types')
const {model} = require('./schema')
const {generate} = require('./generate')

const generateAll = def('generateAll', {}, [$.StrMap($.Integer), $.StrMap($.Array($.Any))],
  counts => Object.keys(counts)
    .reduce((data, name) => {
      const make = generate(model(mongoose.model(name)))
      data[name] = []
      for(let i = 0; i < counts[name]; i++)
        data[name].push(make())
      return data
    }, {})
)

const insertAll = def('insertAll', {}, [$.StrMap($.Array($.Any)), $.Any],
  async data => {
    const result = {}
    const names = Object.keys(data)
    for (let i = 0; i < names.length; i++) {
      const name = names[i]
      const Model = mongoose.model(name)
      result[name] = await Model.insertMany(data[name])
    }
    return result
  }
)

const applyRelation = def('applyRelation', {}, [T.Relation, $.StrMap($.Array($.Any)), $.StrMap($.Array($.Any))],
  (relation, data) =>
    (relation.type === 'one-one') ? applyOneOneRelation(relation, data) :
    (relation.type === 'one-many') ? applyOneManyRelation(relation, data) :
    (relation.type === 'many-many') ? applyManyManyRelation(relation, data) :
    data
)

const applyOneOneRelation = def('applyOneOneRelation', {}, [T.Relation, $.StrMap($.Array($.Any)), $.StrMap($.Array($.Any))],
  ({source, target}, data) => {
    const sources = data[source.name]
    const targets = data[target.name]
    if (!sources || !targets || (!source.field && !target.field))
      return data
    let i = 0, j = 0
    if (source.name == target.name)
      j ++
    while (i < sources.length && j < targets.length) {
      if (source.field)
        sources[i][source.field] = targets[j].id
      if (target.field)
        targets[j][target.field] = sources[i].id
      i ++
      j ++
    }
    return data
  }
)

const applyOneManyRelation = def('applyOneManyRelation', {}, [T.Relation, $.StrMap($.Array($.Any)), $.StrMap($.Array($.Any))],
  ({source, target}, data) => {
    const sources = data[source.name]
    const targets = data[target.name]
    if (!sources || !targets || (!source.field && !target.field))
      return data
    const count = Math.floor(targets.length / Math.min(sources.length, Math.floor(targets.length / 2))) + 1
    let i = 0, j = 0
    if (source.name == target.name)
      j = 1
    while (j < targets.length) {
      i = Math.floor(j / count)
      if (source.field)
        sources[i][source.field].push(targets[j].id)
      if (target.field)
        targets[j][target.field] = sources[i].id
      j ++
    }
    return data
  }
)

const applyManyManyRelation = def('applyManyManyRelation', {}, [T.Relation, $.StrMap($.Array($.Any)), $.StrMap($.Array($.Any))],
  ({source, target}, data) => {
    const sources = data[source.name]
    const targets = data[target.name]
    if (!sources || !targets || (!source.field && !target.field))
      return data

    for(let i = 0; i < sources.length; i++) {
      for(let j = 0; j < targets.length; j++) {
        if (Math.random() < 0.5) {
          if (source.field)
            sources[i][source.field].push(targets[j].id)
          if (target.field)
            targets[j][target.field].push(sources[i].id)
        }
      }
    }

    return data
  }
)

const updateAll = def('updateAll', {}, [$.StrMap($.Array($.Any)), $.Any],
  async data => {
    const result = {}
    const names = Object.keys(data)
    for (let i = 0; i < names.length; i++) {
      const name = names[i]
      const Model = mongoose.model(name)
      result[name] = []
      for (let j = 0; j < data[name].length; j++)
        result[name].push(await Model.findOneAndUpdate({_id: data[name][j].id}, data[name][j], {new: true}))
    }
    return result
  }
)

const seed = def('seed', {}, [$.StrMap($.Integer), $.Array(T.Relation), $.Any],
  async (counts, relations) => {
    let data = generateAll(counts)
    data = await insertAll(data)
    relations.forEach(relation => {
      data = applyRelation(relation, data)
    })
    data = await updateAll(data)
    return data
  }
)

module.exports = {seed}
