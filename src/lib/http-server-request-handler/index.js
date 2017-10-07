/* @flow */
import fs from 'fs';
import path from 'path';
//import RequestHandlerInterface from './interface/RequestHandlerInterface';
import {
  REQUEST_HEADER_REGEXP,
  REQUEST_START_LINE_REGEXP,
} from './constants/parser';
import setContentType from './helper/contentType';


export default class HttpServerRequestHandler {
  config: Object;
  defaultConfig: Object;

  defaultConfig: {
    charset: 'utf-8',
  };

  constructor(options?: Object = {}) {
    // TODO Refactor
    this.config = { ...this.defaultConfig, ...options };

    if (!('rootDir' in this.config)) {
      throw new Error('You have to provide "rootDir" as option');
    }
  }

  processRequest(socket: Object, data: Object): void {
    const { charset } = this.config;

    const decodedData = data.toString(charset);
    const parsedData = this.parseRequest(decodedData);
    const requestPath = this.config.rootDir + parsedData.uri;

    this.getFileByPath(requestPath)
      .then(data => {
        console.log('DATA', data);
        const extension = path.extname(requestPath).replace('.', '');
        const response = this.prepareResponse(parsedData, data, setContentType(extension));
        console.log('RESPONSE', response);
        this.send(socket, response);
      })
        .catch(error => {
          console.log('ERROR', error);
          const response = this.prepareError(parsedData, 404, 'Page not found!');
          this.send(socket, response);
        });
  }

  send(connection: Object, response: Object): void {
    connection.write(`${response.version}: ${response.code}\r\n`);

    for(let header in response.header) {
      connection.write(`${header}: ${response.headers[header]}\r\n`);
    }

    connection.write('\r\n');

    connection.end(response.body);
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

  getFileByPath(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.open(path, 'r', (err, fd) => {
        if(err) {
          reject(err);

          return;
        }

        fs.readFile(path, (err, data) => {
          if(err) {
            reject(err);

            return;
          }

          resolve(data);
        });
      });
    });
  }

  prepareResponse(request: Object, data: ArrayBuffer, type: string): Object {
    request.code = 200;
      request.body = data;
    request.headers['content-type'] = type;

    return request;
  }

  prepareError(request: Object, code: number, body: string): Object {
    request.code = code;
    request.body = body;

    return request;
  }

}
