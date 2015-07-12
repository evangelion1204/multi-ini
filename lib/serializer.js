var Constants, Serializer, _;

_ = require('lodash');

Constants = require('./constants');

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

  Serializer.prototype.serialize = function(content) {
    var out, section, sectionContent, _results;
    out = "";
    _results = [];
    for (section in content) {
      sectionContent = content[section];
      out += "[" + section + "]" + Constants.line_breaks[this.options.line_breaks];
      _results.push(out += this.serializeContent(sectionContent, ''));
    }
    return _results;
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
          serialized += path + (path.length > 0 ? '.' : '') + key + "[]=" + value + Constants.line_breaks[this.options.line_breaks];
        }
      } else if (_.isObject(subContent)) {
        serialized += this.serializeContent(subContent, path + (path.length > 0 ? '.' : '') + key);
      } else {
        if (this.needToBeQuoted(subContent)) {
          subContent = "\"" + subContent + "\"";
        }
        serialized += path + (path.length > 0 ? '.' : '') + key + "=" + subContent + Constants.line_breaks[this.options.line_breaks];
      }
    }
    return serialized;
  };

  return Serializer;

})();

module.exports = Serializer;
