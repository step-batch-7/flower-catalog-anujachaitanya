const fs = require('fs');
const Response = require('./response');
const CONTENT_TYPES = require('./mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;

const serveStaticFile = req => {
  const path =
    req.url == '/'
      ? `${STATIC_FOLDER}/index.html`
      : `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return new Response();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const findHandler = req => {
  if (req.method === 'GET') return serveStaticFile;
  return () => new Response();
};
const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };