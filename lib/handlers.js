const fs = require('fs');
const url = require('url');
const CONTENT_TYPES = require('./mimeTypes');

const STATIC_FOLDER = `${__dirname}/../public`;

const createTable = function(comments) {
  let table = '';
  comments.forEach(comment => {
    let newDate = new Date(comment.date);
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

const serveGuestBook = function(req) {
  let comments = fs.readFileSync(`${__dirname}/comments.json`, 'utf8');
  comments = JSON.parse(comments);
  const commentsTable = createTable(comments);
  let content = fs.readFileSync(`${STATIC_FOLDER}${req.url}`, 'utf8');
  content = content.replace('__COMMENTS__', commentsTable);
  return { content, contentType: 'text/html', statusCode: 200 };
};

const parseQueryParameters = function(queryText) {
  let params = {};
  const parsedUrl = url.parse(`?${queryText}`, true).query;
  params.username = parsedUrl.username;
  params.comment = parsedUrl.comment;
  return params;
};

const serveGuestBookPost = function(req, data) {
  let comments = fs.readFileSync(`${__dirname}/comments.json`, 'utf8');
  comments = JSON.parse(comments);
  const query = parseQueryParameters(data);
  insertComment(comments, query);
  return serveGuestBook(req);
};

const getPath = function(url) {
  return url == '/' ? `${STATIC_FOLDER}/index.html` : `${STATIC_FOLDER}${url}`;
};

const serveStaticFile = req => {
  const path = getPath(req.url);
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return notFound(req);
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  return { content, contentType, statusCode: 200 };
};

const notFound = function(req) {
  const content = `File Not Found ${req.url}`;
  const contentType = 'text/html';
  const statusCode = 404;
  return { contentType, content, statusCode };
};

const methodNotAllowed = function(req, res) {
  const content = `Method Not Allowed`;
  const contentType = 'text/html';
  const statusCode = 402;
  return { contentType, content, statusCode };
};

const getHandlers = {
  '/guestBook.html': serveGuestBook,
  defaultHandler: serveStaticFile
};

const postHandlers = {
  '/guestBook.html': serveGuestBookPost,
  defaultHandler: notFound
};

const methods = {
  GET: getHandlers,
  POST: postHandlers,
  NOT_ALLOWED: { defaultHandler: methodNotAllowed }
};

const handleRequest = (req, data) => {
  const handlers = methods[req.method] || method.NOT_ALLOWED;
  const handler = handlers[req.url] || handlers.defaultHandler;
  return handler(req, data);
};

module.exports = { handleRequest };
