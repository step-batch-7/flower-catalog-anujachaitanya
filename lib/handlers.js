const fs = require('fs');
const querystring = require('querystring');
const { App } = require('./app');
const CONTENT_TYPES = require('./mimeTypes');
const CODES = require('./statusCodes');

const STATIC_FOLDER = `${__dirname}/../public`;

const createTable = function(comments) {
  let table = '';
  comments.forEach(comment => {
    const newDate = new Date(comment.date);
    table += '<tr>';
    table += `<td> ${newDate.toDateString()} </td>`;
    table += `<td> ${newDate.toLocaleTimeString()} </td>`;
    table += `<td> ${comment.username} </td>`;
    table += `<td> ${comment.comment} </td>`;
    table += '</tr>';
  });
  return table;
};

const insertComment = function(comments, req) {
  const comment = req;
  comment.date = new Date();
  comments.unshift(comment);
  fs.writeFileSync(`${__dirname}/comments.json`, JSON.stringify(comments));
  return comments;
};

const serveGuestBook = function(req, res) {
  let comments = fs.readFileSync(`${__dirname}/comments.json`, 'utf8');
  comments = JSON.parse(comments);
  const commentsTable = createTable(comments);
  let content = fs.readFileSync(`${STATIC_FOLDER}${req.url}`, 'utf8');
  content = content.replace('__COMMENTS__', commentsTable);
  res.writeHead(CODES.SUCCESS, { 'Content-Type': 'text/html' });
  res.end(content);
};

const parseQueryParameters = function(queryText) {
  const params = {};
  const parsedUrl = querystring.parse(queryText);
  params.username = parsedUrl.username;
  params.comment = parsedUrl.comment;
  return params;
};

const saveComment = function(req, res) {
  let comments = fs.readFileSync(`${__dirname}/comments.json`, 'utf8');
  comments = JSON.parse(comments);
  const comment = parseQueryParameters(req.body);
  insertComment(comments, comment);

  res.writeHead(CODES.REDIRECTION, {
    'Content-Type': 'text/html',
    location: '/guestBook.html'
  });
  res.end();
};

const getPath = function(url) {
  return url === '/' ? `${STATIC_FOLDER}/index.html` : `${STATIC_FOLDER}${url}`;
};

const getStat = path => {
  return fs.existsSync(path) && fs.statSync(path);
};

const serveStaticFile = (req, res, next) => {
  const path = getPath(req.url);
  const stat = getStat(path);
  if (!stat || !stat.isFile()) {
    return next();
  }
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  res.setHeader('Content-Type', contentType);
  res.end(content);
};

const notFound = function(req, res) {
  const content = `File Not Found ${req.url}`;
  const contentType = 'text/html';
  res.writeHead(CODES.NOT_FOUND, { 'Content-Type': contentType });
  res.end(content);
};

const methodNotAllowed = function(req, res) {
  const content = `Method Not Allowed ${req.method}`;
  const contentType = 'text/html';
  res.writeHead(CODES.INVALID_METHOD, { 'Content-Type': contentType });
  res.end(content);
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data = data + chunk;
  });
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const app = new App();

app.use(readBody);
app.get('/guestBook.html', serveGuestBook);
app.get('', serveStaticFile);
app.post('/guestBook.html', saveComment);
app.get('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
