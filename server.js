const { Server } = require('net');
const Request = require('./lib/request');

const handleConnection = function(socket) {
  const remote = { address: socket.remoteAddress, port: socket.remotePort };
  console.log('connected to >> ', remote);
  socket.on('data', text => {
    console.log(text);
    const req = Request.parse(text);
    console.log(req);
  });
  socket.setEncoding('utf8');
};

const main = function() {
  const server = new Server();
  server.on('connection', handleConnection);
  server.listen(2300);
};

main();
