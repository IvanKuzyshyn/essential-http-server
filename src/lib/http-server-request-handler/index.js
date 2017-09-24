/* @flow */
import fs from 'fs';
import Path from 'path';
//import RequestHandlerInterface from './interface/RequestHandlerInterface';
import {
  REQUEST_HEADER_REGEXP,
  REQUEST_START_LINE_REGEXP,
} from './constants/parser';

export default class HttpServerRequestHandler {
  config: Object;
  defaultConfig: Object;

  defaultConfig: {
    charset: 'utf-8'
  };

  constructor(options?: Object = {}) {
    this.config = { ...this.defaultConfig, ...options };

    if(!('rootDir' in this.config)) {
      throw new Error('You have to provide "rootDir" as option');
    }
  }

  processRequest(data: Object) {
    const { charset } = this.config;

    const decodedData = data.toString(charset);
    const parsedData = this.parseRequest(decodedData);

    const requestPath = this.resolvePath(this.config.rootDir + parsedData.uri);
  }

  parseRequest(request: string): Object {
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

  resolvePath(path: string) {
    console.log('REQUIRED PATH', path);
      fs.open(path, 'r', (err, fd) => {
          if (err) {
              if (err.code === 'ENOENT') {
                  console.error('file does not exist');
                  return;
              }

              throw err;
          }

          console.log('file exists', fd);
      });
  }
}
