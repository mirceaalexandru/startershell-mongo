const service = require('./lib/service')
const config = require('./config');

async function init() {
  await config.init();
  await service.start(config.get())
}

init();