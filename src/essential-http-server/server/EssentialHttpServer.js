import net from 'net';
import defaultConfig from '../config/server';
import ResponseFormatter from '../service/ResponseFormatter';

export const STATUS_RUNNED = 'runned';
export const STATUS_HALT = 'halt';

export default class EssentialHttpServer {

  constructor(config) {
    this.config = {...defaultConfig, ...config};
    this.isStarted = false;

    this.construct();

    return {
      start: this.start,
      stop: this.stop,
      restart: this.restart,
      getStatus: this.getStatus,
    }
  }

  construct() {
    this.server = net.createServer();

    this.server.on('connection', socket => {
      const formatter = new ResponseFormatter(this.config.rootDir);

      socket.on('data', data => {
        formatter.send(data, socket);
      });
    });
  }

  start = () => {
    if(this.isStarted) {
      global.console.warn('Server has been already started!');

      return;
    }

    this.server.listen({port: this.config.port}, () => {
      global.console.log(`Server is running. PORT ${this.server.address()}`);
    });
  };

  stop = () => {

  };

  restart = () => {
    this.stop();
    this.start();
  };

  getStatus = () => {
    if(this.isStarted) {
      return STATUS_RUNNED;
    }

    return STATUS_HALT;
  };

}
