const { MongoClient, ObjectID } = require('mongodb');

exports.plugin = {
  register: async (server) => {
    const client = await MongoClient.connect(server.app.config.db);

    server.decorate('server', 'db', { client, connection: client.db(), ObjectID });

    await prepareDBStructure(server.db.connection);
    server.events.on('stop', () => {
      server.db.client.close();
    })
  },
  name: 'db',
  version: '1.0.0'
}

async function prepareDBStructure(conn) {
  // need to explicitly create collections as it cannot be created in a multi-document transaction
  await conn.createCollection('categories');
  await conn.createCollection('templates');
}