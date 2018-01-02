import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { REQUEST_START_LINE_REGEXP, REQUEST_HEADER_REGEXP } from '../config/formatter';
import setContentType from '../helper/contentType';

const openAsync = promisify(fs.open);
const readFileAsync = promisify(fs.readFile);

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

  read = filePath => new Promise(async (resolve, reject) => {
    try {
      await openAsync(filePath, 'r');
      const file = await readFileAsync(filePath);

      resolve(file);
    } catch(error) {
      reject(error);
    }
  });

  buildResponse = async (request, socket) => {
    const requestFile = this.config.rootDir + request.uri;

    try {
      const fileData = await this.read(requestFile);
      const fileType = path.extname(requestFile).replace(/\./, '');
      const response = this.prepareResponse(request, fileData, 200, fileType);

      this.sendResponse(response, socket);
    } catch(error) {
      const response = this.prepareResponse(request, 'File not found', 404);

      this.sendResponse(response, socket);
    }
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
