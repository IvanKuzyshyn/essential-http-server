// @flow

export type ResponseFormatterConfigType = {
  rootDir: string,
  charset: string,
};

export type ParsedRequestType = {
  headers: Object,
  method: string,
  uri: string,
  version: string,
};
