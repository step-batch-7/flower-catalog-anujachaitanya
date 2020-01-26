const { Server } = require('net');
const Request = require('./lib/request');
const { processRequest } = require('./lib/processRequest');

const handleConnection = function(socket) {
  const remote = { address: socket.remoteAddress, port: socket.remotePort };
  socket.on('data', text => {
    const req = Request.parse(text);
    const res = processRequest(req);
    res.writeTo(socket);
  });
  socket.on('end', () => console.warn(remote, 'ended'));
  socket.setEncoding('utf8');
};

const main = function() {
  const server = new Server();
  server.on('connection', handleConnection);
  server.listen(2300);
};

main();
