const fs = require('fs');
const CONTENT_TYPES = require('./mimeTypes');
const Response = require('./response');

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

const getResponse = function(content, contentType) {
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const insertComment = function(comments, req) {
  const comment = req.body;
  comment.date = new Date();
  comments.unshift(comment);
  fs.writeFileSync(`${__dirname}/comments.json`, JSON.stringify(comments));
  return comments;
};

const serveGuestBook = function(req) {
  let comments = fs.readFileSync(`${__dirname}/comments.json`, 'utf8');
  comments = JSON.parse(comments);
  if (req.method == 'POST') insertComment(comments, req);
  const commentsTable = createTable(comments);
  let content = fs.readFileSync(`${STATIC_FOLDER}/guestBook.html`, 'utf8');
  content = content.replace('__COMMENTS__', commentsTable);
  return getResponse(content, 'text/html');
};

const getPath = function(url) {
  return url == '/' ? `${STATIC_FOLDER}/index.html` : `${STATIC_FOLDER}${url}`;
};

const serveStaticFile = req => {
  const path = getPath(req.url);
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return new Response();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  return getResponse(content, contentType);
};

const findHandler = req => {
  if (req.url == '/guestBook.html') return serveGuestBook;
  if (req.method === 'GET') return serveStaticFile;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
