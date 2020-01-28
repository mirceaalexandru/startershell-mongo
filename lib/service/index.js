const Boom = require('@hapi/boom');
const Hapi = require('@hapi/hapi')
const plugins = require('./plugins')
const api = require('./../api')
const db = require('./db');

async function start (config) {
  const { version } = config.service

  const server = await register (config);
  await server.start();

  server.logger().info(`Server ${config.projectName}@${version} running at: ${server.info.uri}`);

  process.on('SIGINT', () => {
    server.stop({timeout: 10000})
      .then(() => {
        process.exit(0);
      })
      .catch(() => {
        process.exit(1);
      })
  })

  return server;
}

async function register (config) {
  const { service: {host, port} } = config

  const server = new Hapi.Server({
    port,
    host,
    routes: {
      validate: {
        failAction: async (request, h, err) => {
          // log endpoint validation error details.
          request.server.logger().error('ValidationError:', err.message);
          throw Boom.badRequest('Invalid request payload input');
        }
      }
    }
  });

  server.app.config = config
  await server.register([
    ...plugins.configure(config),
    db,
    ...api
  ])

  return server;
}

module.exports = {
  start,
  register
}
