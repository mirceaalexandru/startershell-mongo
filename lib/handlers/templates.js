const {
  create: createModel,
  remove: removeModel,
  move: moveModel
} = require('./../models/templates');

function createTemplate(req) {
  const {
    name,
    parentCategoryId
  } = req.payload;

  return createModel(req, {name, parentCategoryId});
}

async function deleteTemplate(req) {
  const {
    templateId
  } = req.params;

  await removeModel(req, {templateId});
  return {};
}

async function moveTemplate(req) {
  const {
    templateId,
    parentCategoryId
  } = req.params;

  await moveModel(req, {templateId, parentCategoryId});
  return {};
}

module.exports = {
  createTemplate,
  deleteTemplate,
  moveTemplate
}