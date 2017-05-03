'use strict';

const _ = require('lodash');
const Constants = require('./constants');

const defaults = {
    line_breaks: 'unix',
    keep_quotes: false,
};


class Serializer {
    constructor(options = {}) {
        this.options = Object.assign({}, defaults, options);
    }

    needToBeQuoted(value) {
        if (this.options.keep_quotes) {
            return false;
        }

        // wrapped with qoutes
        if (value.match(/^"[\s\S]*?"$/g)) {
            return false;
        }

        // escaped quote at the end
        if (value.match(/^[\s\S]*?\\"$/g)) {
            return true;
        }

        // ends or starts with a quote
        if (value.match(/^[\s\S]*?"$/g) || value.match(/^"[\s\S]*?$/g)) {
            return false;
        }

        return true;
    }

    serialize(content) {
        return _.reduce(content, (output, sectionContent, section) => {
            output += `[${section}]` + Constants.line_breaks[this.options.line_breaks];
            output += this.serializeContent(sectionContent, '');
            return output;
        }, '');
    }

    serializeContent(content, path) {
        return _.reduce(content, (serialized, subContent, key) => {
            if (_.isArray(subContent)) {
                for (let value of subContent) {
                    if (this.needToBeQuoted(value)) {
                        value = `"${value}"`;
                    }

                    serialized += path + (path.length > 0 ? '.' : '') + key + "[]=" + value + Constants.line_breaks[this.options.line_breaks];
                }
            }
            else if (_.isObject(subContent)) {
                serialized += this.serializeContent(subContent, path + (path.length > 0 ? '.' : '') + key);
            }
            else {
                if (this.needToBeQuoted(subContent)) {
                    subContent = `"${subContent}"`;
                }

                serialized += path + (path.length > 0 ? '.' : '') + key + "=" + subContent + Constants.line_breaks[this.options.line_breaks];
            }

            return serialized;
        }, '');
    }
}

module.exports = Serializer;
