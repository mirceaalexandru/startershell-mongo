const Joi = require('@hapi/joi');
const {
  createCategory,
  deleteCategory,
  moveCategory
} = require('./../handlers/categories')

exports.plugin = {
  register: server => {
    server.route({
      path: '/v1/categories',
      method: 'POST',
      options: {
        description: 'Create a category',
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
              id: Joi.string().length(24).hex().required()
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
        tags: ['api', 'categories'],
      },
      handler: createCategory
    })

    server.route({
      path: '/v1/categories/{categoryId}',
      method: 'DELETE',
      options: {
        description: 'Delete a category and all children (categories and/or templates)',
        validate: {
          params: Joi.object().keys({
            categoryId: Joi.string().length(24).hex().required()
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
            }).description('If category cannot be found'),
            500: Joi.object({
              statusCode: Joi.number().required(),
              error: Joi.string().required(),
              message: Joi.string().required()
            })
          }
        },
        tags: ['api', 'categories'],
      },
      handler: deleteCategory
    })

    server.route({
      path: '/v1/categories/{categoryId}/parentCategory/{parentCategoryId?}',
      method: 'PUT',
      options: {
        description: 'Move a category and all children (categories and/or templates) to a different parent category',
        validate: {
          params: Joi.object().keys({
            categoryId: Joi.string().length(24).hex().required(),
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
        tags: ['api', 'categories'],
      },
      handler: moveCategory
    })
  },
  name: 'categories',
  version: '1.0.0'
}
