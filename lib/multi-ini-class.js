var MultiIni, Parser, Serializer, constants, fs, _;

fs = require('fs');

_ = require('lodash');

Parser = require('./parser');

Serializer = require('./serializer');

constants = require('./constants');

MultiIni = (function() {
  MultiIni.prototype["default"] = {
    encoding: 'utf8',
    ignore_invalid: true,
    keep_quotes: false,
    oninvalid: function() {
      return true;
    },
    filters: [],
    line_breaks: 'unix'
  };

  function MultiIni(options) {
    if (options == null) {
      options = {};
    }
    this.options = _.extend(_.clone(this["default"]), options);
    this.parser = new Parser(this.options);
    this.serializer = new Serializer(this.options);
  }

  MultiIni.prototype.read = function(filename) {
    var lines;
    if (!filename) {
      throw new Error('Missing filename.');
    }
    lines = this.fetchLines(filename);
    return this.parser.parse(lines);
  };

  MultiIni.prototype.fetchLines = function(filename) {
    var content;
    content = fs.readFileSync(filename, this.options);
    return content.split(constants.line_breaks[this.options.line_breaks]);
  };

  MultiIni.prototype.write = function(filename, content) {
    if (content == null) {
      content = {};
    }
    return fs.writeFileSync(filename, this.serialize(content), this.options);
  };

  MultiIni.prototype.serialize = function(data) {
    var out, section, sectionContent;
    out = "";
    for (section in data) {
      sectionContent = data[section];
      out += "[" + section + "]" + constants.line_breaks[this.options.line_breaks];
      out += this.serializer.serializeContent(sectionContent, '');
    }
    return out;
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
