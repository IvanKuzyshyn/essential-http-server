import path from 'path';
import EssentialHttpServer from './essential-http-server';

const server = new EssentialHttpServer({rootDir: path.resolve(__dirname, './../public')});

server.start();
