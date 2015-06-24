var MultiIni, Parser, Serializer, fs, _;

fs = require('fs');

_ = require('lodash');

Parser = require('./parser');

Serializer = (function() {
  function Serializer(options) {
    if (options == null) {
      options = {};
    }
    this.options = options;
  }

  return Serializer;

})();

MultiIni = (function() {
  MultiIni.prototype["default"] = {
    encoding: 'utf8',
    ignore_invalid: true,
    keep_quotes: false,
    oninvalid: function() {
      return true;
    },
    filters: []
  };

  function MultiIni(options) {
    if (options == null) {
      options = {};
    }
    this.options = _.extend(_.clone(this["default"]), options);
    this.parser = new Parser(this.options);
  }

  MultiIni.prototype.fetchLines = function(filename) {
    var content;
    content = fs.readFileSync(filename, this.options);
    return content.split('\n');
  };

  MultiIni.prototype.needToBeQuoted = function(value) {
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

  MultiIni.prototype.serializeContent = function(content, path) {
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
          serialized += path + (path.length > 0 ? '.' : '') + key + "[]=" + value + "\n";
        }
      } else if (_.isObject(subContent)) {
        serialized += this.serializeContent(subContent, path + (path.length > 0 ? '.' : '') + key);
      } else {
        if (this.needToBeQuoted(subContent)) {
          subContent = "\"" + subContent + "\"";
        }
        serialized += path + (path.length > 0 ? '.' : '') + key + "=" + subContent + "\n";
      }
    }
    return serialized;
  };

  MultiIni.prototype.serialize = function(data) {
    var out, section, sectionContent;
    out = "";
    for (section in data) {
      sectionContent = data[section];
      out += "[" + section + "]\n";
      out += this.serializeContent(sectionContent, '');
    }
    return out;
  };

  MultiIni.prototype.read = function(filename) {
    var lines;
    if (filename == null) {
      filename = {};
    }
    lines = this.fetchLines(filename);
    return this.parser.parse(lines);
  };

  MultiIni.prototype.write = function(filename, content) {
    if (content == null) {
      content = {};
    }
    return fs.writeFileSync(filename, this.serialize(content), this.options);
  };

  return MultiIni;

})();

module.exports = {
  Class: MultiIni,
  filters: {
    lowercase: function(value) {
      if (_.isString(value)) {
        return value.toLowerCase();
      } else {
        return value;
      }
    },
    uppercase: function(value) {
      if (_.isString(value)) {
        return value.toUpperCase();
      } else {
        return value;
      }
    },
    trim: function(value) {
      if (_.isString(value)) {
        return value.trim();
      } else {
        return value;
      }
    }
  },
  read: function(filename, options) {
    var instance;
    if (options == null) {
      options = {};
    }
    instance = new MultiIni(options);
    return instance.read(filename);
  },
  write: function(filename, content, options) {
    var instance;
    if (options == null) {
      options = {};
    }
    instance = new MultiIni(options);
    return instance.write(filename, content);
  }
};
