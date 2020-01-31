const fs = require('fs');
const querystring = require('querystring');
const config = require('../config');
const { App } = require('./app');
const { CommentLog, Comment } = require('./commentLog');
// const { Comment } = require('./comment');
const CONTENT_TYPES = require('./mimeTypes');
const CODES = require('./statusCodes');

const STATIC_FOLDER = `${__dirname}/../public`;

const COMMENT_STORE = config.DATA_STORE;
const comments = CommentLog.load(fs.readFileSync(COMMENT_STORE, 'utf8'));

// const createTable = function(comments) {
//   let table = '';
//   comments.forEach(comment => {
//     const newDate = new Date(comment.date);
//     table += '<tr>';
//     table += `<td> ${newDate.toDateString()} </td>`;
//     table += `<td> ${newDate.toLocaleTimeString()} </td>`;
//     table += `<td> ${comment.username} </td>`;
//     table += `<td> ${comment.comment} </td>`;
//     table += '</tr>';
//   });
//   return table;
// };

// const insertComment = function(comments, req) {
//   const comment = req;
//   comment.date = new Date();
//   comments.unshift(comment);
//   fs.writeFileSync(`${__dirname}/comments.json`, JSON.stringify(comments));
//   return comments;
// };

const serveGuestBook = function(req, res) {
  const content = fs.readFileSync(`${STATIC_FOLDER}/guestBook.html`, 'utf8');
  const responseBody = content.replace('__COMMENTS__', comments.toHTML());
  res.writeHead(CODES.OK, {
    'Content-Type': 'text/html',
    'Content-Length': responseBody.length
  });
  res.end(responseBody);
};

const saveComment = function(req, res) {
  const comment = new Comment(req.body.username, req.body.comment, new Date());
  comments.addComment(comment);
  fs.writeFileSync(COMMENT_STORE, comments.toJSON());
  res.writeHead(CODES.FOUND, {
    Location: '/guestBook.html'
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
  res.writeHead(CODES.METHOD_NOT_ALLOWED, { 'Content-Type': contentType });
  res.end(content);
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data = data + chunk;
  });
  req.on('end', () => {
    req.body = data;
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      req.body = querystring.parse(req.body);
    }
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
