const http = require('http');
const { processRequest } = require('./lib/processRequest');

const handleConnection = function(req, res) {
  const responseText = processRequest(req);
  res.end(responseText.body);
};

const main = function() {
  const server = new http.Server(handleConnection);
  server.listen(2300, () => {
    console.log('started listening on port :', server.address());
  });
};

main();
