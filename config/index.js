const environment = require('./environment')
const schema = require('./schema')

const internals = {}

async function init() {
  // try to load using dotenv
  // in production dotenv will not be installed so this will not be used.
  try {
    // eslint-disable-next-line
    require('dotenv').config({path: '.env', silent: true})
  } catch (err) {
    // ignore this error for production
  }

  internals.config = await schema.validate(environment());
  console.log({config: internals.config}, 'Load using configuration'); // eslint-disable-line
}

function get() {
  return internals.config;
}

module.exports = {
  init,
  get
}
