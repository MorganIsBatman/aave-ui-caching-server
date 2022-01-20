
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./protocol-js.cjs.production.min.js')
} else {
  module.exports = require('./protocol-js.cjs.development.js')
}
