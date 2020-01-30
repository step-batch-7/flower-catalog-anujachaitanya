const request = require('supertest');
const { app } = require('../lib/handlers');

describe('GET /', () => {
  it('should return index.html if / is given for path', done => {
    const expectedHeading = new RegExp('<h1>Flower Catalog</h1>');
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-Length', '1014')
      .expect('Content-Type', 'text/html')
      .expect(expectedHeading)
      .expect(200, done);
  });

  it('should return guestBook.html', done => {
    const expectedHeading = new RegExp('<h1>Leave a comment</h1>');
    request(app.serve.bind(app))
      .get('/guestBook.html')
      .expect('Content-Type', 'text/html')
      .expect(expectedHeading)
      .expect(200, done);
  });

  it('should give not found if bad file', done => {
    request(app.serve.bind(app))
      .get('/bad')
      .expect('Content-Type', 'text/html')
      .expect(404, done);
  });
});
