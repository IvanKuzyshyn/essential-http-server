// @flow

import types from '../constants/content-types';

export default function setContentType(type: string): string {
  if(!(type in types)) return 'application/json; charset=utf-8';

  return types[type];
}