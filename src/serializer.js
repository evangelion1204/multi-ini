const _ = require('lodash');
const Constants = require('./constants');

class Serializer {
    constructor(options = {}) {
        this.options = options
    }

    needToBeQuoted(value) {
        if (value.match(/^"[\s\S]*?"$/g)) {
            return false;
        }

        if (value.match(/^[\s\S]*?\\"$/g)) {
            return true;
        }

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
