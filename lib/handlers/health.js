const {name, version} = require('./../../package.json')

function handler() {
  return {
    name,
    version
  }
}

module.exports = {
  handler
}