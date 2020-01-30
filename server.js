const http = require('http');
const { stdout } = require('process');
const { app } = require('./lib/handlers');

const main = function() {
  const server = new http.Server(app.serve.bind(app));
  const DEFAULT_PORT = 4000;
  server.listen(DEFAULT_PORT, () =>
    stdout.write(`started listening on ${DEFAULT_PORT}`)
  );
};

main();
