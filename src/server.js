// @flow
import net from 'net';

import config from './config/server';

const server = net.createServer();

server.on('connection', socket => {
  socket.on('data', data => {
    console.log(data.toString('utf-8'));
  });
});

server.listen({port: config.port || process.env.PORT}, () => {
  console.log('opened server on', server.address());
});
