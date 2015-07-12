var Serializer, constants, _;

_ = require('lodash');

constants = require('./constants');

Serializer = (function() {
  Serializer.prototype.line_breaks = {
    unix: '\n',
    windows: '\r\n'
  };

  function Serializer(options) {
    if (options == null) {
      options = {};
    }
    this.options = options;
  }

  Serializer.prototype.needToBeQuoted = function(value) {
    if (value.match(/^"[\s\S]*?"$/g)) {
      return false;
    }
    if (value.match(/^[\s\S]*?\\"$/g)) {
      return true;
    }
    if (value.match(/^[\s\S]*?"$/g)) {
      return false;
    }
    if (value.match(/^"[\s\S]*?$/g)) {
      return false;
    }
    return true;
  };

  Serializer.prototype.serializeContent = function(content, path) {
    var key, serialized, subContent, value, _i, _len;
    serialized = '';
    for (key in content) {
      subContent = content[key];
      if (_.isArray(subContent)) {
        for (_i = 0, _len = subContent.length; _i < _len; _i++) {
          value = subContent[_i];
          if (this.needToBeQuoted(value)) {
            value = "\"" + value + "\"";
          }
          serialized += path + (path.length > 0 ? '.' : '') + key + "[]=" + value + constants.line_breaks[this.options.line_breaks];
        }
      } else if (_.isObject(subContent)) {
        serialized += this.serializeContent(subContent, path + (path.length > 0 ? '.' : '') + key);
      } else {
        if (this.needToBeQuoted(subContent)) {
          subContent = "\"" + subContent + "\"";
        }
        serialized += path + (path.length > 0 ? '.' : '') + key + "=" + subContent + constants.line_breaks[this.options.line_breaks];
      }
    }
    return serialized;
  };

  return Serializer;

})();

module.exports = Serializer;
