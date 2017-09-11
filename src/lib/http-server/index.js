/* @flow */
interface Server {
    port:number;
}

export default class HttpServer implements Server {

    constructor(port) {
        this.port = port;
    }

}
