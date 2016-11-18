'use strict';

const MultiIni = require('./multi-ini-class');
const Parser = require('./parser');
const Serializer = require('./serializer');
const filters = require('./filters');

export {
    filters,
    MultiIni as Class,
    Parser,
    Serializer,
};

export function read(filename, options = {}) {
    const instance = new MultiIni(options);
    return instance.read(filename);
}

export function write(filename, content, options = {}) {
    const instance = new MultiIni(options);
    return instance.write(filename, content);
}
