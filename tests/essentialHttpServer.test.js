/* eslint-disable */

import path from 'path';
import EssentialHttpServer from '../src/essential-http-server';
import {
  STATUS_RUNNED,
  STATUS_HALT,
} from '../src/essential-http-server/server/EssentialHttpServer';

describe('Server workflow', () => {
  it('Server runs and stops correctly', () => {
    const server = new EssentialHttpServer({
      rootDir: path.resolve(__dirname, './source'),
    });

    expect(server.getStatus()).toEqual(STATUS_HALT);

    server.start(() => {
      expect(server.getStatus()).toEqual(STATUS_RUNNED);

      server.stop(() => {
          expect(server.getStatus()).toEqual(STATUS_HALT);
      });
    });
  });

  it('Runs exception if root directory is undefined', () => {
    expect(() => {
        const server = new EssentialHttpServer();
    }).toThrow();

  });
});
