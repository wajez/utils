const assert = require('chai').assert
const {id, merge, mapObj, applySpec, applyConverter} = require('../src')

describe('Lib', () => {

  describe('id', () => {
    it('returns the id of the object', () => {
      const buf = Buffer.from('1125', 'hex')
      assert.equal(id({id: buf}), '1125')
    })
    it('returns the object if id is missing', () => {
      const buf = Buffer.from('1125', 'hex')
      assert.equal(id(buf), '1125')
    })
  })

  describe('merge', () => {
    it('merges two objects', () => {
      assert.deepEqual(merge({}, {}), {})
      assert.deepEqual(merge({a: 1}, {}), {a: 1})
      assert.deepEqual(merge({a: 1}, {b: 2}), {a: 1, b: 2})
      assert.deepEqual(merge({a: 1, b: 1}, {b: 2}), {a: 1, b: 2})
      assert.deepEqual(merge({a: 1, b: 1}, {b: 2, c: 3}), {a: 1, b: 2, c: 3})
      assert.deepEqual(merge({a: 1, d: {e: 'Hi'}}, {b: 2, c: 3}), {a: 1, b: 2, c: 3, d: {e: 'Hi'}})
      assert.deepEqual(merge({a: 1, d: {e: 'Hi'}}, {b: 2, c: 3, d: {}}), {a: 1, b: 2, c: 3, d: {e: 'Hi'}})
      assert.deepEqual(merge({a: 1, d: {e: 'Hi'}}, {b: 2, c: 3, d: {f: 'Yo'}}), {a: 1, b: 2, c: 3, d: {e: 'Hi', f: 'Yo'}})
      assert.deepEqual(merge({a: 1, d: {e: 'Hi'}}, {b: 2, c: 3, d: {e: {g: true}, f: 'Yo'}}), {a: 1, b: 2, c: 3, d: {e: {g: true}, f: 'Yo'}})
    })
  })

  describe('mapObj', () => {
    const addOne = _ => _ + 1
    it('maps a function over an object', () => {
      assert.deepEqual(
        mapObj(
          _ => _ == 1 ? 10 : _ == 2 ? 'Hey' : addOne,
          { x: 1, y: 2, z: 3 }
        ),
        { x: 10, y: 'Hey', z: addOne }
      )
    })
  })

  describe('applySpec', () => {
    it('applies a specification of functions to a value', () => {
      assert.deepEqual(applySpec({
        fullName: _ => _.firstName + ' ' + _.lastName,
        adult: _ => _.age > 18
      }, {
        firstName: 'Amine',
        lastName: 'Ben hammou',
        age: 27
      }), {
        fullName: 'Amine Ben hammou',
        adult: true
      })
    })
  })

  describe('applyConverter', () => {
    it('applies a function to a value', () => {
      assert.deepEqual(applyConverter(_ => _.firstName + ' ' + _.lastName, {
        firstName: 'Amine',
        lastName: 'Ben hammou',
        age: 27
      }), 'Amine Ben hammou')
      assert.deepEqual(applyConverter(_ => _.firstName + ' ' + _.lastName, undefined), undefined)
    })
    it('applies an object of functions to a value', () => {
      assert.deepEqual(applyConverter({
        firstName: _ => _,
        lastName: _ => _.toUpperCase(),
        age: _ => _ - 6
      }, {
        firstName: 'Amine',
        lastName: 'Ben hammou',
        age: 27
      }), {
        firstName: 'Amine',
        lastName: 'BEN HAMMOU',
        age: 21
      })
    })
    it('ignores missing attributes', () => {
      assert.deepEqual(applyConverter({
        firstName: _ => _,
        lastName: _ => _.toUpperCase(),
      }, {
        firstName: 'Amine',
        lastName: 'Ben hammou',
        age: 27
      }), {
        firstName: 'Amine',
        lastName: 'BEN HAMMOU'
      })
    })
    it('applies multiple converters', () => {
      assert.deepEqual(applyConverter([
        {
          firstName: _ => _,
          lastName: _ => _.toUpperCase(),
        },
        _ => ({fullName: _.firstName + ' ' + _.lastName}),
        _ => _.fullName
      ], {
        firstName: 'Amine',
        lastName: 'Ben hammou',
        age: 27
      }),
      'Amine BEN HAMMOU')
    })
    it('is recursive', () => {
      assert.deepEqual(applyConverter({
        infos: {
          firstName: _ => _,
          lastName: _ => _.toUpperCase(),
        },
        age: _ => _ - 6
      }, {
        infos: {
          firstName: 'Amine',
          lastName: 'Ben hammou',
        },
        age: 27
      }), {
        infos: {
          firstName: 'Amine',
          lastName: 'BEN HAMMOU'
        },
        age: 21
      })
    })
    it('handles arrays', () => {
      assert.deepEqual(applyConverter({
        infos: {
          firstName: _ => _,
          lastName: _ => _.toUpperCase(),
        },
        projects: {
          name: _ => _.toUpperCase(),
          score: _ => _ * 2
        }
      }, {
        infos: {
          firstName: 'Amine',
          lastName: 'Ben hammou',
        },
        age: 27,
        projects: [{
          name: 'tarsana',
          score: 100,
        }, {
          name: 'wajez',
          score: 10
        }]
      }), {
        infos: {
          firstName: 'Amine',
          lastName: 'BEN HAMMOU'
        },
        projects: [{
          name: 'TARSANA',
          score: 200
        }, {
          name: 'WAJEZ',
          score: 20
        }]
      })
    })
  })

})
