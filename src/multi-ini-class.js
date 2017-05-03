'use strict';

const fs = require('fs');
const _  = require('lodash');

const Parser = require('./parser');
const Serializer = require('./serializer');
const Constants = require('./constants');

const defaults = {
    encoding: 'utf8',
    line_breaks: 'unix',
};

class MultiIni {
    constructor(options = {}) {
        this.options = Object.assign({}, defaults, options);

        this.parser = new Parser(this.options);
        this.serializer = new Serializer(this.options);
    }

    read(filename) {
        if (!filename) {
            throw new Error('Missing filename.');
        }

        const lines = this.fetchLines(filename);

        return this.parser.parse(lines);
    }

    fetchLines(filename) {
        const content = fs.readFileSync(filename, this.options);

        return content.split(Constants.line_breaks[this.options.line_breaks]);
    }

    write(filename, content = {}) {
        fs.writeFileSync(filename, this.serializer.serialize(content), this.options);

        return ;
    }
}

module.exports = MultiIni;
