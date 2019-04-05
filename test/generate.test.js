const {assert} = require('chai')
const {generate, unique, number} = require('../src')

describe('Generate', () => {
  it('generates unique values', () => {
    const values = {}
    const getNumber = generate(unique(number()))
    for (let i = 0; i < 150; i++) {
      let x = getNumber()
      if (values[x] !== undefined) throw `Generated ${x} twice!`
      values[x] = true
    }
  })
})
