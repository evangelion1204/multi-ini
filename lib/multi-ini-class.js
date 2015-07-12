var Constants, MultiIni, Parser, Serializer, fs, _;

fs = require('fs');

_ = require('lodash');

Parser = require('./parser');

Serializer = require('./serializer');

Constants = require('./constants');

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
    return content.split(Constants.line_breaks[this.options.line_breaks]);
  };

  MultiIni.prototype.write = function(filename, content) {
    if (content == null) {
      content = {};
    }
    fs.writeFileSync(filename, this.serializer.serialize(content), this.options);
  };

  return MultiIni;

})();

module.exports = MultiIni;
