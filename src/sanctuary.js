const $ = require ('sanctuary-def')
const {create, env} = require('sanctuary')

const checkTypes = process.env.NODE_ENV !== 'production'

module.exports = {
    $,
    S: create({checkTypes, env}),
    def: $.create({checkTypes, env: $.env}),
}
