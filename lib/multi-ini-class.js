var MultiIni, fs, _;

fs = require('fs');

_ = require('lodash');

MultiIni = (function() {
  function MultiIni() {}

  MultiIni.prototype.options = {
    encoding: 'utf8'
  };

  MultiIni.prototype.regExpSection = /^\s*\[(.*?)\]\s*$/;

  MultiIni.prototype.regExpComment = /^;.*/;

  MultiIni.prototype.regExpSimpleSingleLine = /^\s*(.*?)\s*?=\s*?([^"].*?)$/;

  MultiIni.prototype.regExpQuotedSingleLine = /^\s*(.*?)\s*?=\s*?"(.*?)"$/;

  MultiIni.prototype.regExpMultiLine = /^\s*(.*?)\s*?=\s*?"(.*?)$/;

  MultiIni.prototype.regExpMultiLineEnd = /^(.*?)"$/;

  MultiIni.prototype.regExpArray = /^(.*?)\[\]$/;

  MultiIni.prototype.isSection = function(line) {
    return line.match(this.regExpSection);
  };

  MultiIni.prototype.getSection = function(line) {
    return line.match(this.regExpSection)[1];
  };

  MultiIni.prototype.isComment = function(line) {
    return line.match(this.regExpComment);
  };

  MultiIni.prototype.isSingleLine = function(line) {
    return line.match(this.regExpQuotedSingleLine) || line.match(this.regExpSimpleSingleLine);
  };

  MultiIni.prototype.isMultiLine = function(line) {
    return line.match(this.regExpMultiLine);
  };

  MultiIni.prototype.isMultiLineEnd = function(line) {
    return line.match(this.regExpMultiLineEnd);
  };

  MultiIni.prototype.isArray = function(line) {
    return line.match(this.regExpArray);
  };

  MultiIni.prototype.assignValue = function(element, keys, value) {
    var array, current, key, previous, _i, _len;
    current = element;
    previous = element;
    array = false;
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      if (this.isArray(key)) {
        key = this.getArrayKey(key);
        array = true;
      }
      if (current[key] == null) {
        current[key] = array ? [] : {};
      }
      previous = current;
      current = current[key];
    }
    if (array) {
      current.push(value);
    } else {
      previous[key] = value;
    }
    return element;
  };

  MultiIni.prototype.getKeyValue = function(line) {
    var result;
    result = line.match(this.regExpQuotedSingleLine);
    if (result) {
      return [result[1], result[2]];
    }
    result = line.match(this.regExpSimpleSingleLine);
    if (result) {
      return [result[1], result[2]];
    }
    throw new Error();
  };

  MultiIni.prototype.getMultiKeyValue = function(line) {
    var result;
    result = line.match(this.regExpMultiLine);
    if (result) {
      return [result[1], result[2]];
    }
  };

  MultiIni.prototype.getMultiLineEndValue = function(line) {
    var result;
    result = line.match(this.regExpMultiLineEnd);
    if (result) {
      return result[1];
    }
  };

  MultiIni.prototype.getArrayKey = function(line) {
    var result;
    result = line.match(this.regExpArray);
    return result[1];
  };

  MultiIni.prototype.fetchLines = function(filename, options) {
    var content;
    content = fs.readFileSync(filename, options);
    return content.split('\n');
  };

  MultiIni.prototype.serializeContent = function(content, path) {
    var key, serialized, subContent, value, _i, _len;
    serialized = '';
    for (key in content) {
      subContent = content[key];
      if (_.isArray(subContent)) {
        for (_i = 0, _len = subContent.length; _i < _len; _i++) {
          value = subContent[_i];
          serialized += path + (path.length > 0 ? '.' : '') + key + "[]=\"" + value + "\"\n";
        }
      } else if (_.isObject(subContent)) {
        serialized += this.serializeContent(subContent, path + (path.length > 0 ? '.' : '') + key);
      } else {
        serialized += path + (path.length > 0 ? '.' : '') + key + "=\"" + subContent + "\"\n";
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

  MultiIni.prototype.read = function(filename, options) {
    var current, ini, key, keys, line, lines, multiLineKeys, multiLineValue, section, value, _i, _len, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    options = _.extend(_.clone(this.options), options);
    lines = this.fetchLines(filename, options);
    ini = {};
    current = ini;
    multiLineKeys = false;
    multiLineValue = '';
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      line = line.trim();
      if (this.isComment(line)) {

      } else if (this.isSection(line)) {
        section = this.getSection(line);
        if (typeof ini[section] === 'undefined') {
          ini[section] = {};
        }
        current = ini[section];
      } else if (this.isSingleLine(line)) {
        _ref = this.getKeyValue(line), key = _ref[0], value = _ref[1];
        keys = key.split('.');
        this.assignValue(current, keys, value);
      } else if (this.isMultiLine(line)) {
        _ref1 = this.getMultiKeyValue(line), key = _ref1[0], value = _ref1[1];
        keys = key.split('.');
        multiLineKeys = keys;
        multiLineValue = value;
      } else if (multiLineKeys) {
        if (this.isMultiLineEnd(line)) {
          multiLineValue += '\n' + this.getMultiLineEndValue(line);
          this.assignValue(current, multiLineKeys, multiLineValue);
          multiLineKeys = false;
          multiLineValue = "";
        } else {
          multiLineValue += '\n' + line;
        }
      }
    }
    return ini;
  };

  MultiIni.prototype.write = function(filename, content, options) {
    if (options == null) {
      options = {};
    }
    options = _.extend(_.clone(this.options), options);
    return fs.writeFileSync(filename, this.serialize(content), options);
  };

  return MultiIni;

})();

module.exports = new MultiIni;
