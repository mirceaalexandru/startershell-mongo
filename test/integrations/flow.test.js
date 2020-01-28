const assert = require('assert');
const {register} = require('../../lib/service/index');

describe('API tests', () => {
  let server;
  before(async () => {
    server = await register({
      service: {},
      db: 'mongodb://localhost:27017/challenge_test'
    });

    // clean test DB
    await server.db.connection.collection('categories').deleteMany({});
    await server.db.connection.collection('templates').deleteMany({});
  });

  after(async () => {
    await server.stop();
  });

  const internals = {
    categories: {},
    templates: {}
  };

  describe('a complex flow is created', async () => {
    it('should be able to insert Travel Destinations category', async () => {
      const name = 'Travel Destination';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      const category = await server.db.connection.collection('categories')
        .findOne({_id: new server.db.ObjectID(res.result.id)});

      assert.ok(category);
      assert.equal(category.name, name);
      assert.equal(category.categories.length, 0);
      assert.equal(category.templates.length, 0);

      internals.categories.travelDestinations = res.result.id;
    });

    it('should be able to insert Mexico category', async () => {
      const name = 'Mexico';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
          parentCategoryId: internals.categories.travelDestinations
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test category
      const category = await server.db.connection.collection('categories')
        .findOne({_id: new server.db.ObjectID(res.result.id)});

      assert.ok(category);
      assert.equal(category.name, name);
      assert.equal(category.categories.length, 0);
      assert.equal(category.templates.length, 0);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: new server.db.ObjectID(internals.categories.travelDestinations)});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 1);
      assert.equal(parentCategory.templates.length, 0);

      internals.categories.mexico = res.result.id;
    });

    it('should be able to insert Germany category', async () => {
      const name = 'Germany';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
          parentCategoryId: internals.categories.travelDestinations
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test category
      const category = await server.db.connection.collection('categories')
        .findOne({_id: res.result.id});

      assert.ok(category);
      assert.equal(category.name, name);
      assert.equal(category.categories.length, 0);
      assert.equal(category.templates.length, 0);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 2);
      assert.equal(parentCategory.templates.length, 0);

      internals.categories.germany = res.result.id;
    });

    it('should be able to insert acapulco templates', async () => {
      const name = 'acapulco';
      const res = await server.inject({
        method: 'post',
        url: `/v1/templates`,
        payload: {
          name,
          parentCategoryId: internals.categories.mexico
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test template
      const template = await server.db.connection.collection('templates')
        .findOne({_id: res.result.id});

      assert.ok(template);
      assert.equal(template.name, name);

      // test root
      const rootCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.ok(rootCategory);
      assert.equal(rootCategory.categories.length, 2);
      assert.equal(rootCategory.templates.length, 0);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.mexico});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 0);
      assert.equal(parentCategory.templates.length, 1);

      internals.templates.acapulco = res.result.id;
    });

    it('should be able to insert munich template', async () => {
      const name = 'munich';
      const res = await server.inject({
        method: 'post',
        url: `/v1/templates`,
        payload: {
          name,
          parentCategoryId: internals.categories.germany
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test template
      const template = await server.db.connection.collection('templates')
        .findOne({_id: res.result.id});

      assert.ok(template);
      assert.equal(template.name, name);

      // test root
      const rootCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.ok(rootCategory);
      assert.equal(rootCategory.categories.length, 2);
      assert.equal(rootCategory.templates.length, 0);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.germany});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 0);
      assert.equal(parentCategory.templates.length, 1);

      internals.templates.munich = res.result.id;
    });

    it('should be able to insert Beach category', async () => {
      const name = 'Beach';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
          parentCategoryId: internals.categories.germany
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test category
      const category = await server.db.connection.collection('categories')
        .findOne({_id: res.result.id});

      assert.ok(category);
      assert.equal(category.name, name);
      assert.equal(category.categories.length, 0);
      assert.equal(category.templates.length, 0);

      // test root
      const rootCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.ok(rootCategory);
      assert.equal(rootCategory.categories.length, 2);
      assert.equal(rootCategory.templates.length, 0);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.germany});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 1);
      assert.equal(parentCategory.templates.length, 1);

      internals.categories.beach = res.result.id;
    });

    it('should be able to insert los cabos templates', async () => {
      const name = 'los cabos';
      const res = await server.inject({
        method: 'post',
        url: `/v1/templates`,
        payload: {
          name,
          parentCategoryId: internals.categories.beach
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test template
      const template = await server.db.connection.collection('templates')
        .findOne({_id: res.result.id});

      assert.ok(template);
      assert.equal(template.name, name);

      // test root
      const rootCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.ok(rootCategory);
      assert.equal(rootCategory.categories.length, 2);
      assert.equal(rootCategory.templates.length, 0);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.beach});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 0);
      assert.equal(parentCategory.templates.length, 1);

      internals.templates.loscabos = res.result.id;
    });

    it('should be able to insert Exclusive category', async () => {
      const name = 'Exclusive';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
          parentCategoryId: internals.categories.beach
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test category
      const category = await server.db.connection.collection('categories')
        .findOne({_id: res.result.id});

      assert.ok(category);
      assert.equal(category.name, name);
      assert.equal(category.categories.length, 0);
      assert.equal(category.templates.length, 0);

      // test root
      const rootCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.ok(rootCategory);
      assert.equal(rootCategory.categories.length, 2);
      assert.equal(rootCategory.templates.length, 0);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.beach});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 1);
      assert.equal(parentCategory.templates.length, 1);

      internals.categories.exclusive = res.result.id;
    });

    it('should be able to insert la paz template', async () => {
      const name = 'la paz';
      const res = await server.inject({
        method: 'post',
        url: `/v1/templates`,
        payload: {
          name,
          parentCategoryId: internals.categories.exclusive
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test template
      const template = await server.db.connection.collection('templates')
        .findOne({_id: res.result.id});

      assert.ok(template);
      assert.equal(template.name, name);

      // test root
      const rootCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.ok(rootCategory);
      assert.equal(rootCategory.categories.length, 2);
      assert.equal(rootCategory.templates.length, 0);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.exclusive});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 0);
      assert.equal(parentCategory.templates.length, 1);

      internals.templates.lapaz = res.result.id;
    });

    it('cannot move category Beach to template acapulco', async () => {
      const res = await server.inject({
        method: 'put',
        url: `/v1/categories/${internals.categories.beach}/parentCategory/${internals.templates.acapulco}`
      });

      assert.ok(res);
      assert.equal(res.statusCode, 404);

      // test template
      const category = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.beach});

      assert.ok(category);
      assert.equal(category.categories.length, 1);
      assert.equal(category.templates.length, 1);

      // test parent
      const parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.germany});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 1);
      assert.equal(parentCategory.categories[0], internals.categories.beach);
      assert.equal(parentCategory.templates.length, 1);
    });

    it('should be able to move Beach category to Mexico', async () => {
      // test old parent
      let oldParentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.germany});

      assert.ok(oldParentCategory);
      assert.equal(oldParentCategory.categories.length, 1);
      assert.equal(oldParentCategory.templates.length, 1);

      // test new parent
      let parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.mexico});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 0);
      assert.equal(parentCategory.templates.length, 1);

      const res = await server.inject({
        method: 'put',
        url: `/v1/categories/${internals.categories.beach}/parentCategory/${internals.categories.mexico}`
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);

      // test category
      const category = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.beach});

      assert.ok(category);
      assert.equal(category.categories.length, 1);
      assert.equal(category.templates.length, 1);

      // test old parent
      oldParentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.germany});

      assert.ok(oldParentCategory);
      assert.equal(oldParentCategory.categories.length, 0);
      assert.equal(oldParentCategory.templates.length, 1);

      // test new parent
      parentCategory = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.mexico});

      assert.ok(parentCategory);
      assert.equal(parentCategory.categories.length, 1);
      assert.equal(parentCategory.templates.length, 1);
      assert.equal(parentCategory.categories[0], internals.categories.beach);
    });

    it('should be able to delete Beach category', async () => {
      // test new parent
      let category = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.beach});

      assert.ok(category);

      const res = await server.inject({
        method: 'delete',
        url: `/v1/categories/${internals.categories.beach}`
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);

      category = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.beach});

      assert.equal(category, null);

    });

    it('should be able to insert memo template without parent category', async () => {
      const name = 'memo';
      const res = await server.inject({
        method: 'post',
        url: `/v1/templates`,
        payload: {
          name
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test template
      const template = await server.db.connection.collection('templates')
        .findOne({_id: res.result.id});

      assert.ok(template);
      assert.equal(template.name, name);

      // test that there are no categories with this template
      const category = await server.db.connection.collection('categories')
        .findOne({templates: res.result.id});

      assert.equal(category, null);
    });

    it('extra test - delete root category should clean database, one single template should remain (memo)', async () => {
      // test new parent
      let category = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.ok(category);

      const res = await server.inject({
        method: 'delete',
        url: `/v1/categories/${internals.categories.travelDestinations}`
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);

      category = await server.db.connection.collection('categories')
        .findOne({_id: internals.categories.travelDestinations});

      assert.equal(category, null);

    });
  });
});
