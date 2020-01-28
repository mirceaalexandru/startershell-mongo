const Joi = require('@hapi/joi');
const {
  createTemplate,
  deleteTemplate,
  moveTemplate
} = require('./../handlers/templates')

exports.plugin = {
  register: server => {
    server.route({
      path: '/v1/templates',
      method: 'POST',
      options: {
        description: 'Create a template',
        validate: {
          payload: Joi.object().keys({
            name: Joi.string().min(1).required(),
            parentCategoryId: Joi.string().length(24).hex().optional()
          })
        },
        response: {
          failAction: 'log',
          status: {
            200: Joi.object().keys({
              id: Joi.string().length(24).hex().required(),
            }),
            404: Joi.object({
              statusCode: Joi.number().required(),
              error: Joi.string().required(),
              message: Joi.string().required()
            }).description('If parent category id cannot be found'),
            500: Joi.object({
              statusCode: Joi.number().required(),
              error: Joi.string().required(),
              message: Joi.string().required()
            })
          }
        },
        tags: ['api', 'templates'],
      },
      handler: createTemplate
    })

    server.route({
      path: '/v1/templates/{templateId}',
      method: 'DELETE',
      options: {
        description: 'Delete a template',
        validate: {
          params: Joi.object().keys({
            templateId: Joi.string().length(24).hex().required()
          })
        },
        response: {
          failAction: 'log',
          status: {
            200: Joi.object(),
            404: Joi.object({
              statusCode: Joi.number().required(),
              error: Joi.string().required(),
              message: Joi.string().required()
            }).description('If template cannot be found'),
            500: Joi.object({
              statusCode: Joi.number().required(),
              error: Joi.string().required(),
              message: Joi.string().required()
            })
          }
        },
        tags: ['api', 'templates'],
      },
      handler: deleteTemplate
    })


    server.route({
      path: '/v1/templates/{templateId}/parentCategory/{parentCategoryId?}',
      method: 'PUT',
      options: {
        description: 'Move a template to a different parent category',
        validate: {
          params: Joi.object().keys({
            templateId: Joi.string().length(24).hex().required(),
            parentCategoryId: Joi.string().length(24).hex().optional()
          })
        },
        response: {
          failAction: 'log',
          status: {
            200: Joi.object(),
            404: Joi.object({
              statusCode: Joi.number().required(),
              error: Joi.string().required(),
              message: Joi.string().required()
            }).description('If parent category cannot be found'),
            500: Joi.object({
              statusCode: Joi.number().required(),
              error: Joi.string().required(),
              message: Joi.string().required()
            })
          }
        },
        tags: ['api', 'templates'],
      },
      handler: moveTemplate
    })
  },
  name: 'templates',
  version: '1.0.0'
}
