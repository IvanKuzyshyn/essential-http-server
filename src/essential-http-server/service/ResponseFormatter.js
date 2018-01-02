// @flow
/* eslint-disable array-callback-return */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import {
  REQUEST_START_LINE_REGEXP,
  REQUEST_HEADER_REGEXP,
} from '../config/formatter';
import setContentType from '../helper/contentType';
import type { ResponseFormatterConfigType } from '../type/serviceTypes';

const openAsync = promisify(fs.open);
const readFileAsync = promisify(fs.readFile);

export default class ResponseFormatter {
  config: ResponseFormatterConfigType;

  constructor(rootDir: string, charset: string = 'utf-8') {
    this.config = { rootDir, charset };

    return { send: this.send };
  }

  send = (data: ArrayBuffer, socket: net$Socket) => {
    const request = this.parseRequest(data);

    this.buildResponse(request, socket);
  };

  // TODO: Correct set up ParsedRequestType
  parseRequest = (data: ArrayBuffer): Object => {
    // $FlowFixMe
    const decodedRequest = data.toString(this.config.charset);
    let request = {
      headers: {},
    };
    const requestParts = decodedRequest.trim().split('\r\n');

    requestParts.forEach(part => {
      if (REQUEST_START_LINE_REGEXP.test(part)) {
        // $FlowFixMe
        const [, method, uri, version] = part.match(REQUEST_START_LINE_REGEXP);

        request = { ...request, method, version };
        request.uri = uri === '/' ? '/index.html' : uri;
      } else if (REQUEST_HEADER_REGEXP.test(part)) {
        // $FlowFixMe
        const [, property, value] = part.match(REQUEST_HEADER_REGEXP);

        request.headers[property] = value;
      } else {
        global.console.warn('Undefined part of request object', part);
      }
    });

    return request;
  };

  read = (filePath: string): Promise<Function> =>
    new Promise(async (resolve, reject) => {
      try {
        await openAsync(filePath, 'r');
        const file = await readFileAsync(filePath);

        resolve(file);
      } catch (error) {
        reject(error);
      }
    });

  buildResponse = async (request: Object, socket: net$Socket) => {
    console.log('URI', request.uri);
    const requestFile = this.config.rootDir + request.uri;

    try {
      const fileData: ArrayBuffer = await this.read(requestFile);
      const fileType = path.extname(requestFile).replace(/\./, '');
      const response = this.prepareResponse(request, fileData, 200, fileType);

      this.sendResponse(response, socket);
    } catch (error) {
      const response = this.prepareResponse(request, 'File not found', 404);

      this.sendResponse(response, socket);
    }
  };

  prepareResponse = (
    request: Object,
    body: ArrayBuffer | string,
    code: number,
    requestFileType?: string | null = null,
  ): Object => {
    let response = { ...request };

    if (requestFileType) {
      response.headers['content-type'] = setContentType(requestFileType);
    }

    response = { ...response, body, code };

    return response;
  };

  sendResponse = (response: Object, socket: net$Socket): void => {
    socket.write(`${response.version}: ${response.code}\r\n`);

    Object.keys(response.headers).map(key => {
      socket.write(`${key}: ${response.headers[key]}\r\n`);
    });

    socket.write('\r\n');
    socket.end(response.body);
  };
}
