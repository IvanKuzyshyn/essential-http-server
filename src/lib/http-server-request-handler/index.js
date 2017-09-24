/* @flow */
//import RequestHandlerInterface from './interface/RequestHandlerInterface';
import {
  REQUEST_HEADER_REGEXP,
  REQUEST_START_LINE_REGEXP,
} from './constants/parser';

export default class HttpServerRequestHandler {
  config: Object;
  defaultConfig: Object;

  defaultConfig: {
    charset: 'utf-8',
  };

  constructor(options?: Object = {}) {
    this.config = { ...this.defaultConfig, ...options };
  }

  processRequest(data: Object) {
    const { charset } = this.config;

    const decodedData = data.toString(charset);
    const parsedData = this.parseRequest(decodedData);

    console.log('PARSED\r\n', parsedData);
  }

  parseRequest(request: string) {
    let performedRequest = { headers: {} };
    const requestLines = request.trim().split('\r\n');

    requestLines.forEach(line => {
      if (REQUEST_START_LINE_REGEXP.test(line)) {
        const [, method, uri, version] = line.match(REQUEST_START_LINE_REGEXP);

        performedRequest.method = method;
        performedRequest.uri = uri;
        performedRequest.version = version;
      } else if (REQUEST_HEADER_REGEXP.test(line)) {
        const [, property, value] = line.match(REQUEST_HEADER_REGEXP);
        performedRequest.headers[property] = value;
      } else {
        console.warn('undefined pattern', line);
      }
    });

    return performedRequest;
  }
}
