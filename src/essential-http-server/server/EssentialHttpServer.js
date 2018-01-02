/* @flow */

import net from 'net';
import defaultConfig from '../config/server';
import ResponseFormatter from '../service/ResponseFormatter';
import type { ServerConfigType } from '../type/serverTypes';

export const STATUS_RUNNED = 'runned';
export const STATUS_HALT = 'halt';

export default class EssentialHttpServer {
  config: ServerConfigType;
  isStarted: boolean;
  server: net$Server;

  static isStarted = false;

  constructor(config: ServerConfigType) {
    this.config = { ...defaultConfig, ...config };

    this.construct();
  }

  construct = (): void => {
    this.server = net.createServer();

    this.server.on('connection', (socket: net$Socket) => {
      const formatter = new ResponseFormatter(this.config.rootDir);

      socket.on('data', data => {
        formatter.send(data, socket);
      });
    });
  };

  start = (): void => {
    if (this.isStarted) {
      global.console.warn('Server has been already started!');

      return;
    }

    this.server.listen({ port: this.config.port }, () => {
      global.console.log(`Server is running on ${this.config.port} port`);
    });
  };

  stop = (): void => {};

  restart = (): void => {
    this.stop();
    this.start();
  };

  getStatus = (): string => {
    if (this.isStarted) {
      return STATUS_RUNNED;
    }

    return STATUS_HALT;
  };
}
