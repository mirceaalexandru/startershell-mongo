const Joi = require('@hapi/joi');

const schema =
  Joi.object().keys({
    service: {
      port: Joi.number().integer().required(),
      host: Joi.string().min(3).required(),
      version: Joi.string().min(3).required(),
    },
    env: Joi.string().valid('development', 'testing', 'staging', 'production').required(),
    projectName: Joi.string().required(),
    db: Joi.string().required(),
  }).unknown()


module.exports = schema;
