const {
  create: createModel,
  remove: removeModel,
  move: moveModel
} = require('./../models/categories');

function createCategory(req) {
  const {
    name,
    parentCategoryId
  } = req.payload;

  return createModel(req, {name, parentCategoryId});
}

async function deleteCategory(req) {
  const {
    categoryId
  } = req.params;

  await removeModel(req, {categoryId});
  return {};
}

async function moveCategory(req) {
  const {
    categoryId,
    parentCategoryId
  } = req.params;

  await moveModel(req, {categoryId, parentCategoryId});
  return {};
}

module.exports = {
  createCategory,
  deleteCategory,
  moveCategory
}