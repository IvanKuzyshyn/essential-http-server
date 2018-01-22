// @flow
import { Readable } from 'stream';
import type { Socket } from 'net';

export default class Request extends Readable {
  socket: Socket;
  needToBeRead: boolean = false;
  HEADERS_END_MARKER: string = '\r\n\r\n';

  constructor(socket: Socket) {
    super();

    this.socket = socket;
    this.socket.on('data', this.processData);
  }

  processData = (chunk: Buffer) => {
    const { socket, HEADERS_END_MARKER, needToBeRead } = this;
    const headersEndPosition = chunk.indexOf(HEADERS_END_MARKER);

    if (headersEndPosition === -1) {
      socket.unshift(chunk);

      return;
    }

    this.emit('headers');

    const rawHeader = chunk.slice(0, headersEndPosition).toString;

    socket.unshift(chunk.slice(headersEndPosition + HEADERS_END_MARKER.length));
    socket.pause();

    if (needToBeRead) {
        this.push(socket.read());
    }
  };

  _read() {
      if(this.socket.isPaused()) {
          this.push(this.socket.read());
      } else {
          this.needToBeRead = true;
      }
  }
}
