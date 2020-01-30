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

  it('should return Ageratum', done => {
    const expectedHeading = new RegExp(' Ageratum</header>');
    request(app.serve.bind(app))
      .get('/Ageratum.html')
      .expect('Content-Length', '1338')
      .expect('Content-Type', 'text/html')
      .expect(expectedHeading)
      .expect(200, done);
  });

  it('should return Ageratum', done => {
    const expectedHeading = new RegExp(' Abeliophyllum</header>');
    request(app.serve.bind(app))
      .get('/Abeliophyllum.html')
      .expect('Content-Length', '1569')
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

describe('POST /', () => {
  it('should run post method on /guestBook.html', done => {
    request(app.serve.bind(app))
      .post('/guestBook.html')
      .send('username=anuja&comment=heyy')
      .expect(302, done);
  });

  it('should give method not found for post on index.html', done => {
    request(app.serve.bind(app))
      .post('/index.html')
      .send('username=anuja&comment=heyy')
      .expect(405, done);
  });
});
