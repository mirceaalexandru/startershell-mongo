const Boom = require('@hapi/boom');

async function create(req, {
  name,
  parentCategoryId
}) {
  const {logger} = req;
  const {client, connection, ObjectID} = req.server.db;

  const session = client.startSession();
  session.startTransaction();
  const opts = { session };
  try {
    if (parentCategoryId) {
      // first validate that parent exists
      const parent = await connection.collection('categories').findOne({
        _id: new ObjectID(parentCategoryId)
      }, opts);

      if (!parent) {
        throw Boom.notFound('Parent category not found');
      }
    }
    const category = await connection.collection('categories').insertOne({
      name,
      categories: [],
      templates: []
    }, opts);

    if (parentCategoryId) {
      // link parent
      await connection.collection('categories').updateOne(
        {
          _id: new ObjectID(parentCategoryId)
        },
        {
          $addToSet: {
            categories: category.insertedId.toString()
          }
        },
        opts
      );
    }

    await session.commitTransaction();
    session.endSession();

    return {id: category.insertedId};
  }catch(err) {
    logger.error({err}, 'Error creating category');
    await session.abortTransaction();
    session.endSession();

    throw err.isBoom ? err : Boom.internal();
  }
}

async function move(req, {
  categoryId,
  parentCategoryId
}) {
  const {logger} = req;
  const {client, connection, ObjectID} = req.server.db;

  const session = client.startSession();
  session.startTransaction();
  const opts = { session };
  try {
    await connection.collection('categories').updateOne(
      {
        categories: categoryId
      },
      {
        $pull: { categories: categoryId }
      },
      opts);

    if (parentCategoryId) {
      // link parent
      const res = await connection.collection('categories').updateOne(
        {
          _id: new ObjectID(parentCategoryId)
        },
        {
          $addToSet: {
            categories: categoryId.toString()
          }
        },
        opts
      );

      if (res.result.nModified === 0) {
        throw Boom.notFound('Parent category not found');
      }
    }

    await session.commitTransaction();
    session.endSession();

    return {};
  }catch(err) {
    logger.error({err}, 'Error moving category');
    await session.abortTransaction();
    session.endSession();

    throw err.isBoom ? err : Boom.internal();
  }

}

async function remove(req, { categoryId }) {
  const {logger} = req;
  const {client, connection} = req.server.db;

  const session = client.startSession();
  session.startTransaction();
  const opts = { session };
  try {
    // remove from parent
    await removeCategory({categoryId}, {req, opts});

    await connection.collection('categories').updateOne(
      {
        categories: categoryId
      },
      {
        $pull: { categories: categoryId }
      },
      opts);

    await session.commitTransaction();
    session.endSession();

    return {};
  }catch(err) {
    logger.error({err}, 'Error deleting category');
    await session.abortTransaction();
    session.endSession();

    throw err.isBoom ? err : Boom.internal();
  }
}

async function removeCategory({categoryId}, {req, opts}) {
  const {connection, ObjectID} = req.server.db;
  const {logger} = req;

  const category = await connection.collection('categories').findOne(
    {
      _id: new ObjectID(categoryId)
    },
    {
      categories: true,
      templates: true
    }
  );

  if (!category) {
    logger.error({categoryId}, 'Cannot find category to delete.');
    throw Boom.notFound('Category not found');
  }

  // delete templates
  if (category.templates.length) {
    await connection.collection('templates').deleteMany(
      {
        _id: {$in: category.templates.map(id => new ObjectID(id))}
      },
      opts
    );
  }

  // remove child categories
  if (category.categories.length) {
    await Promise.all(
      category.categories.map(id => removeCategory({categoryId: id}, {req, opts}))
    )
  }

  // finally remove this category
  await connection.collection('categories').deleteOne(
    {
      _id: new ObjectID(categoryId)
    },
    opts
  );
}

module.exports = {
  create,
  remove,
  move
}