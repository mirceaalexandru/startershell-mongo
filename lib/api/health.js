const { handler } = require('./../handlers/health')

exports.plugin = {
  register: server => {
    server.route({
      path: '/v1/health',
      method: 'GET',
      handler
    })
  },
  name: 'health',
  version: '1.0.0'
}
