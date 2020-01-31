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

  it('should return html file', done => {
    const expectedHeading = new RegExp('Ageratum</header>');
    request(app.serve.bind(app))
      .get('/Ageratum.html')
      .expect('Content-Length', '1338')
      .expect('Content-Type', 'text/html')
      .expect(expectedHeading)
      .expect(200, done);
  });

  it('should return image file', done => {
    request(app.serve.bind(app))
      .get('/images/pbase-agerantum.jpg')
      .expect('Content-Length', '55554')
      .expect('Content-Type', 'image/jpeg')
      .expect(200, done);
  });

  it('should return css file', done => {
    const expectedHeading = new RegExp('.description {');
    request(app.serve.bind(app))
      .get('/css/flower.css')
      .expect(expectedHeading)
      .expect('Content-Length', '262')
      .expect('Content-Type', 'text/css')
      .expect(200, done);
  });

  it('should return pdf file ', done => {
    request(app.serve.bind(app))
      .get('/images/flower.gif')
      .expect('Content-Length', '65088')
      .expect('Content-Type', 'image/gif')
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
  it('should give method not found for post on index.html', done => {
    request(app.serve.bind(app))
      .post('/index.html')
      .send('username=anuja&comment=heyy')
      .expect(405, done);
  });
});

describe('INVALID METHODS', () => {
  it('should give method not found for requests other than post or get', done => {
    request(app.serve.bind(app))
      .put('/index.html')
      .expect(405, done);
  });
});
