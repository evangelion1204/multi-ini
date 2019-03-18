'use strict';

const _ = require('lodash');
const Constants = require('./constants');

const defaults = {
    line_breaks: 'unix',
    keep_quotes: false,
    keep_comments: false,
};


class Serializer {
    constructor(options = {}) {
        this.options = Object.assign({}, defaults, options);
    }

    needToBeQuoted(value) {
        if (this.options.keep_quotes) {
            return false;
        }

        if (_.isArray(value)) {
            return false;
        }

        if (_.isObject(value)) {
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
            if (this.options.keep_comments && _.startsWith(section,';')) {
                for (let i = 0; i < sectionContent.length; ++i)
                    output += ';' + sectionContent[i] + Constants.line_breaks[this.options.line_breaks];
            }
            else {
                output += `[${section}]` + Constants.line_breaks[this.options.line_breaks];
                output += this.serializeContent(sectionContent, '');
            }
            return output;
        }, '');
    }

    getComment(content, path, key, arr_i) {
      let str = '', cKey = ';' + key;

      if (!content.hasOwnProperty(cKey)) {
          return str;
      }
      const comment = arr_i !== null ? content[cKey][arr_i] : content[cKey];

      if (comment.length > 0) {
          for (let i = 0; i < comment.length; ++i)
              str += ';' + comment[i] + Constants.line_breaks[this.options.line_breaks];
      }

      return str;
    };

    serializeContent(content, path) {
        return _.reduce(content, (serialized, subContent, key) => {

            if (_.isArray(subContent)) {
                if (this.options.keep_comments && _.startsWith(key,';')) {
                    return serialized;
                }

                for (let i = 0; i < subContent.length; ++i) {
                    let value = subContent[i];

                    if (this.needToBeQuoted(value)) {
                        value = `"${value}"`;
                    }

                    if (this.options.keep_comments) {
                        serialized += this.getComment(content, path, key, i);
                    }
                    serialized += path + (path.length > 0 ? '.' : '') + key + "[]=" + value + Constants.line_breaks[this.options.line_breaks];
                }
            }
            else if (_.isObject(subContent)) {
                serialized += this.serializeContent(subContent, path + (path.length > 0 ? '.' : '') + key);
            }
            else {

                if (this.options.keep_comments && _.startsWith(key,';')) {
                    return serialized;
                }

                if (this.needToBeQuoted(subContent)) {
                    subContent = `"${subContent}"`;
                }

                if (this.options.keep_comments) {
                    serialized += this.getComment(content, path, key, null);
                }
                serialized += path + (path.length > 0 ? '.' : '') + key + "=" + subContent + Constants.line_breaks[this.options.line_breaks];
            }

            return serialized;
        }, '');
    }
}


module.exports = Serializer;
