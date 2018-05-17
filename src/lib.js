const {$, def, S} = require('./sanctuary')
const T = require('./types')

const I = _ => _

const id = _ => (_.id === undefined ? _ : _.id).toString('hex')

const merge = def('merge', {}, [$.StrMap($.Any), $.StrMap($.Any), $.StrMap($.Any)],
  (a, b) => {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    return keysA.concat(keysB).reduce((result, key) => {
      const valueA = a[key]
      const valueB = b[key]
      if (S.is(Object, valueA) && S.is(Object, valueB))
        result[key] = merge(valueA, valueB)
      else
        result[key] = (valueB === undefined) ? valueA : valueB
      return result
    }, {})
  }
)

const mapObj = def('mapObj', {}, [$.AnyFunction, $.Object, $.Object],
  (fn, obj) => Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key])
    return result
  }, {})
)

const applySpec = def('applySpec', {}, [$.StrMap($.AnyFunction), $.Any, $.Any],
  (spec, value) => S.sequence(Function, spec)(value)
)

const applyConverter = def('applyConverter', {}, [$.Any, $.Any, $.Any],
  (converter, value) =>
    value === undefined ? undefined :
    value.constructor === Array ? value.map(_ => applyConverter(converter, _)) :
    converter.constructor === Array ? converter.reduce((v, c) => applyConverter(c, v), value) :
    S.is(Function, converter) ? converter(value) :
    Object.keys(converter).reduce((result, key) => {
      result[key] = applyConverter(converter[key], value[key])
      return result
    }, {})
)

module.exports = {I, id, merge, mapObj, applySpec, applyConverter}
