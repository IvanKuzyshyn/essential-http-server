/* @flow */
//import RequestHandlerInterface from './interface/RequestHandlerInterface';

export default class HttpServerRequestHandler {
  config: Object;
  defaultConfig: Object;

  defaultConfig: {
    charset: 'utf-8',
  };

  constructor(options?: Object = {}) {
    this.config = { ...this.defaultConfig, ...options };
  }

  processData(data: Object) {
    const { charset } = this.config;

    const decodedData = data.toString(charset);

    console.log(decodedData);
  }
}
