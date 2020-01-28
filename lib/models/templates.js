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
        return Boom.notFound('Parent category not found');
      }
    }
    const template = await connection.collection('templates').insertOne({
      name
    }, opts);

    if (parentCategoryId) {
      // link parent
      await connection.collection('categories').updateOne(
        {
          _id: new ObjectID(parentCategoryId)
        },
        {
          $addToSet: {
            templates: template.insertedId.toString()
          }
        },
        opts
      );
    }

    await session.commitTransaction();
    session.endSession();

    return {id: template.insertedId};
  }catch(err) {
    logger.error({err}, 'Error creating template');
    await session.abortTransaction();
    session.endSession();

    return Boom.internal();
  }
}

async function move(req, {
  templateId,
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
        templates: templateId
      },
      {
        $pull: { templates: templateId }
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
            templates: templateId.toString()
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
    logger.error({err}, 'Error moving template category');
    await session.abortTransaction();
    session.endSession();

    throw err.isBoom ? err : Boom.internal();
  }
}

async function remove(req, { templateId }) {
  const {logger} = req;
  const {client, connection, ObjectID} = req.server.db;

  const session = client.startSession();
  session.startTransaction();
  const opts = { session };
  try {
    await connection.collection('categories').updateOne(
      {
        templates: templateId
      },
      {
        $pull: { templates: templateId }
      },
      opts);

    const res = await connection.collection('templates').deleteOne(
      {
        _id: new ObjectID(templateId)
      },
      opts
    );

    if (res.result.n === 0) {
      throw Boom.notFound('Template not found');
    }

    await session.commitTransaction();
    session.endSession();

    return {};
  }catch(err) {
    logger.error({err}, 'Error deleting template');
    await session.abortTransaction();
    session.endSession();

    throw err.isBoom ? err : Boom.internal();
  }
}


module.exports = {
  create,
  remove,
  move
}