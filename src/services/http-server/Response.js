// @flow
import { Writable } from 'stream';
import type { Socket } from 'net';

export default class Response extends Writable {
    socket: Socket;

    constructor(socket: Socket) {
        super();

        this.socket = socket;
    }

}
