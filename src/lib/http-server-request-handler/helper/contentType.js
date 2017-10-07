// @flow
//TODO Import as JSON file
import types from '../data/content-types';

export default function (extension: string): string {
    console.log('GET CONTENT TYPE', types[extension]);

    if(!(extension in types)) return 'application/json; charset=utf-8';

    return types[extension]
}
