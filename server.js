const http = require('http');
const { app } = require('./lib/handlers');

const main = function() {
  const server = new http.Server(app.serve.bind(app));
  server.listen(4000, () =>
    console.log('started listening on ', server.address())
  );
};

main();
