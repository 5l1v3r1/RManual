/* eslint-disable global-require */
// keys.js - figure out what set of credentials to return
if (process.env.NODE_ENV === 'production') {
  // return the prod keys
  module.exports = require('./prod');
} else {
  // return the dev keys
  module.exports = require('./dev');
}
