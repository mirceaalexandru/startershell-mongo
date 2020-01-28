const assert = require('assert');
// const sinon = require('sinon');
//const { describe, it } = require('mocha');

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

  describe('when doesn\'t have an existing parentId', async () => {
    it('return 404', async () => {
      const name = 't1';
      const parentCategoryId = '111111111111111111111111';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
          parentCategoryId
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 404);
    });
  });

  describe('when doesn\'t have a valid parentId', async () => {
    it('return 400', async () => {
      const name = 't1';
      const parentCategoryId = '123123';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
          parentCategoryId
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 400);
    });
  });

  describe('when doesn\'t have a valid name', async () => {
    it('return 400', async () => {
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name: ''
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 400);
    });
  });

  describe('when trying to create valid category without parent category', async () => {
    it('return 200', async () => {
      const name = 't1';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);
    });
  });

  describe('when trying to delete non-existing category', async () => {
    it('return 404', async () => {
      const res = await server.inject({
        method: 'delete',
        url: `/v1/categories/111111111111111111111111`
      });

      assert.ok(res);
      assert.equal(res.statusCode, 404);
    });
  });

  describe('when trying to delete category with parent category', async () => {
    it('return 200', async () => {
      // create a category
      const resCat = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name: 'c1'
        }
      });

      assert.ok(resCat);
      assert.equal(resCat.statusCode, 200);
      assert.ok(resCat.result);
      assert.ok(resCat.result.id);
      const catId = resCat.result.id

      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name: 't1',
          parentCategoryId: catId
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test category has template as child
      const cat = await server.db.connection.collection('categories')
        .findOne({_id: catId});

      assert.ok(cat);
      assert.equal(cat.categories.length, 1);
      assert.equal(cat.templates.length, 0);
      assert.equal(cat.categories[0], res.result.id);

      const res2 = await server.inject({
        method: 'delete',
        url: `/v1/categories/${res.result.id}`
      });

      assert.ok(res2);
      assert.equal(res2.statusCode, 200);

      // test category doesn't have template as child
      const cat2 = await server.db.connection.collection('categories')
        .findOne({_id: catId});

      assert.ok(cat2);
      assert.equal(cat2.categories.length, 0);
      assert.equal(cat2.templates.length, 0);
    });
  });

  describe('when trying to delete non-existing category', async () => {
    it('return 404', async () => {
      const res = await server.inject({
        method: 'delete',
        url: `/v1/categories/111111111111111111111111`
      });

      assert.ok(res);
      assert.equal(res.statusCode, 404);
    });
  });

  describe('when trying to move a category to another category', async () => {
    it('return 200', async () => {
      // create a category
      const resCat = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name: 'c1'
        }
      });

      assert.ok(resCat);
      assert.equal(resCat.statusCode, 200);
      assert.ok(resCat.result);
      assert.ok(resCat.result.id);
      const catId = resCat.result.id

      // create another category
      const resCat2 = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name: 'c2'
        }
      });

      assert.ok(resCat2);
      assert.equal(resCat2.statusCode, 200);
      assert.ok(resCat2.result);
      assert.ok(resCat2.result.id);
      const catId2 = resCat2.result.id

      // assign create category on first category
      const name = 't1';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
          parentCategoryId: catId
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test category has template as child
      const cat = await server.db.connection.collection('categories')
        .findOne({_id: catId});

      assert.ok(cat);
      assert.equal(cat.templates.length, 0);
      assert.equal(cat.categories.length, 1);
      assert.equal(cat.categories[0], res.result.id);

      // move to second category
      const res2 = await server.inject({
        method: 'put',
        url: `/v1/categories/${res.result.id}/parentCategory/${catId2}`
      });

      assert.ok(res2);
      assert.equal(res2.statusCode, 200);

      // test first category doesn't have template as child
      const catAfter = await server.db.connection.collection('categories')
        .findOne({_id: catId});

      assert.ok(catAfter);
      assert.equal(catAfter.categories.length, 0);
      assert.equal(catAfter.templates.length, 0);

      // test second category doesn't have template as child
      const cat2After = await server.db.connection.collection('categories')
        .findOne({_id: catId2});

      assert.ok(cat2After);
      assert.equal(cat2After.templates.length, 0);
      assert.equal(cat2After.categories.length, 1);
      assert.equal(cat2After.categories[0], res.result.id);
    });
  });

  describe('when trying to move a category with no parent category to another category', async () => {
    it('return 200', async () => {
      // create a category
      const resCat2 = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name: 'c2'
        }
      });

      assert.ok(resCat2);
      assert.equal(resCat2.statusCode, 200);
      assert.ok(resCat2.result);
      assert.ok(resCat2.result.id);
      const catId = resCat2.result.id

      // create category
      const name = 't1';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test category doesn't have category as child
      const cat = await server.db.connection.collection('categories')
        .findOne({_id: catId});

      assert.ok(cat);
      assert.equal(cat.categories.length, 0);
      assert.equal(cat.templates.length, 0);

      // move to category
      const res2 = await server.inject({
        method: 'put',
        url: `/v1/categories/${res.result.id}/parentCategory/${catId}`
      });

      assert.ok(res2);
      assert.equal(res2.statusCode, 200);

      // test category have template as child
      const cat2After = await server.db.connection.collection('categories')
        .findOne({_id: catId});

      assert.ok(cat2After);
      assert.equal(cat2After.categories.length, 1);
      assert.equal(cat2After.templates.length, 0);
      assert.equal(cat2After.categories[0], res.result.id);
    });
  });

  describe('when trying to move a category from a parent category to no parent', async () => {
    it('return 200', async () => {
      // create a category
      const resCat2 = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name: 'c2'
        }
      });

      assert.ok(resCat2);
      assert.equal(resCat2.statusCode, 200);
      assert.ok(resCat2.result);
      assert.ok(resCat2.result.id);
      const catId = resCat2.result.id

      // create category
      const name = 't1';
      const res = await server.inject({
        method: 'post',
        url: `/v1/categories`,
        payload: {
          name,
          parentCategoryId: catId
        }
      });

      assert.ok(res);
      assert.equal(res.statusCode, 200);
      assert.ok(res.result);
      assert.ok(res.result.id);

      // test category have our category as child
      const cat = await server.db.connection.collection('categories')
        .findOne({_id: catId});

      assert.ok(cat);
      assert.equal(cat.categories.length, 1);
      assert.equal(cat.templates.length, 0);
      assert.equal(cat.categories[0], res.result.id);

      // move to category
      const res2 = await server.inject({
        method: 'put',
        url: `/v1/categories/${res.result.id}/parentCategory`
      });

      assert.ok(res2);
      assert.equal(res2.statusCode, 200);

      // test category doesn't have our category as child
      const cat2After = await server.db.connection.collection('categories')
        .findOne({_id: catId});

      assert.ok(cat2After);
      assert.equal(cat2After.categories.length, 0);
      assert.equal(cat2After.templates.length, 0);
    });
  });

});
