const request = require('supertest');
const { app } = require('../lib/handlers');

describe('GET METHOD', () => {
  it('should return index.html if / is given for path', done => {
    request(app.serve.bind(app))
      .get('/')
      .expect(200, done);
  });
});
