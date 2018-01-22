// @flow
import { EventEmitter } from 'events';
import type net, { Server, Socket } from 'net';

import Request from './Request';
import Response from './Response';

export default class extends EventEmitter {
  server: Server;

  constructor() {
    super();

    this.server = net.createServer();
    this.server.on('connection', this.handleConnection);
  }

  handleConnection = (socket: Socket): void => {
    const req = new Request(socket);
    const res = new Response(socket);

    req.once('headers', this.emit('request', req, res, socket));
  };

  listen = (port: number | string, callback?: Function = () => {}): void => {
    this.server.listen(port, callback);
  };
}
