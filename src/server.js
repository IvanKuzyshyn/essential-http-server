// @flow
import net from 'net';

import config from './config/server';
import RequestHandler from './lib/http-server-request-handler';

const server = net.createServer();

server.on('connection', socket => {
  socket.on('data', data => {
    const dataHandler = new RequestHandler();

    dataHandler.processData(data);
  });
});

server.listen({ port: config.port || process.env.PORT }, () => {
  console.log('opened server on', server.address());
});
