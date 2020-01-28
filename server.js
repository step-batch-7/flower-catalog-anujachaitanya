const http = require('http');
const { processRequest } = require('./lib/processRequest');

const handleConnection = function(req, res) {
  req.setEncoding('utf8');
  let data = '';
  req.on('data', chunk => {
    console.log(chunk);
    console.log(data);
    data = data + chunk;
  });

  req.on('end', () => {
    const response = processRequest(req, data);
    res.setHeader('Content-Type', response.contentType);
    res.setHeader('Status-Code', response.statusCode);
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
