const http = require('http');
const { handleRequest } = require('./lib/handlers');

const handleConnection = function(req, res) {
  req.setEncoding('utf8');
  let data = '';
  req.on('data', chunk => (data += chunk));

  req.on('end', () => {
    const response = handleRequest(req, data);
    res.writeHead(response.statusCode, {
      'Content-Type': response.contentType
    });
    res.end(response.content);
  });
};

const main = function() {
  const server = new http.Server(handleConnection);
  server.listen(2300, () => {
    console.log('started listening on port :', server.address());
  });
};

main();
