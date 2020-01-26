const fs = require('fs');
const CONTENT_TYPES = require('./mimeTypes');
const Response = require('./response');

const STATIC_FOLDER = `${__dirname}/../public`;

const createTable = function(comments) {
  let tableHTML = '';
  comments.forEach(comment => {
    tableHTML += '<tr>';
    tableHTML += `<td> ${comment.date} </td>`;
    tableHTML += `<td> ${comment.time} </td>`;
    tableHTML += `<td> ${comment.username} </td>`;
    tableHTML += `<td> ${comment.comment} </td>`;
    tableHTML += '</tr>';
  });
  return tableHTML;
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
  const newComment = req.body;
  newComment.date = new Date().toDateString();
  newComment.time = new Date().toLocaleTimeString();
  comments.unshift(newComment);
  return comments;
};

const serveGuestBook = function(req) {
  let comments = fs.readFileSync(`${STATIC_FOLDER}/comments.json`, 'utf8');
  comments = JSON.parse(comments);
  if (req.method == 'POST') insertComment(comments, req);
  fs.writeFileSync(`${STATIC_FOLDER}/comments.json`, JSON.stringify(comments));
  const commentsTable = createTable(comments);
  let content = fs.readFileSync(`${STATIC_FOLDER}/guestBook.html`, 'utf8');
  content = content.replace('__COMMENTS__', commentsTable);
  return getResponse(content, 'text/html');
};

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
