import fs from 'fs';
import path from 'path';
import { REQUEST_START_LINE_REGEXP, REQUEST_HEADER_REGEXP } from '../config/formatter';
import setContentType from '../helper/contentType';

export default class ResponseFormatter {

  constructor(rootDir, charset = 'utf-8') {
    this.config = {rootDir, charset};


    return {send: this.send};
  }

  send = (data, socket) => {
    const request = this.parseRequest(data);

    this.buildResponse(request, socket);
  };

  parseRequest = (data) => {
    const decodedRequest = data.toString(this.config.charset);
    let request = {
      headers: {}
    };
    const requestParts = decodedRequest.trim().split('\r\n');

    requestParts.forEach(part => {
      if(REQUEST_START_LINE_REGEXP.test(part)) {
        const [, method, uri, version] = part.match(REQUEST_START_LINE_REGEXP);

        request = {...request, method, uri, version};
      } else if(REQUEST_HEADER_REGEXP.test(part)) {
        const [, property, value] = part.match(REQUEST_HEADER_REGEXP);

        request.headers[property] = value;
      } else {
        global.console.warn('Undefined part of request object', part);
      }
    });

    return request;
  };

  getRequestedFileByPath = (filePath) => new Promise((resolve, reject) => {
      fs.open(filePath, 'r', error => {
        if(error) {
          reject(error);

          return;
        }

        fs.readFile(filePath, (error, data) => {
          if(error) {
            reject(error);

            return;
          }

          resolve(data);
        });
      });
    });

  buildResponse = (request, socket) => {
    const requestFile = this.config.rootDir + request.uri;

    this.getRequestedFileByPath(requestFile)
      .then(data => {
        const fileType = path.extname(requestFile).replace(/\./, '');
        const response = this.prepareResponse(request, data, 200, fileType);

        this.sendResponse(response, socket);
      })
      .catch(() => {
        const response = this.prepareResponse(request, 'File not found', 404);

        this.sendResponse(response, socket);
      });
  };

  prepareResponse = (request, body, code, requestFileType = null) => {
    let response = {...request};

    if(requestFileType) {
      response.headers['content-type'] = setContentType(requestFileType);
    }

    response = {...response, body, code};

    return response;
  };

  sendResponse = (response, socket) => {
    socket.write(`${response.version}: ${response.code}\r\n`);

    for(const header in response.header) {
      socket.write(`${header}: ${response.headers[header]}\r\n`);
    }

    socket.write('\r\n');

    socket.end(response.body);
  };

}
