const HapiPino = require('hapi-pino')
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const {version} = require('../../package.json')

function configure(config) {
  let plugins = [
    {
      plugin: HapiPino,
      options: {
        prettyPrint: config.env !== 'production',
        logRouteTags: true,
        level: 'debug',
        redact: {
          paths: ['req.headers', 'tags'],
          remove: true
        }
      }
    }
  ]

  if (config.env === 'development') {
    // Swagger documentation is available only in development environment.
    plugins = [
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: {
          info: {
            title: `API Documentation (V${version})`,
            version,
          },
          grouping: 'tags'
        }
      },
      ...plugins
    ]
  }
  return plugins
}

module.exports = {
  configure
}
