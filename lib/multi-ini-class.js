var MultiIni, fs, _;

fs = require('fs');

_ = require('lodash');

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

  MultiIni.prototype.regExpSection = /^\s*\[(.*?)\]\s*$/;

  MultiIni.prototype.regExpComment = /^;.*/;

  MultiIni.prototype.regExpSingleLine = /^\s*(.*?)\s*?=\s*?(\S.*?)$/;

  MultiIni.prototype.regExpMultiLine = /^\s*(.*?)\s*?=\s*?"(.*?)$/;

  MultiIni.prototype.regExpNotEscapedMultiLineEnd = /^(.*?)\\"$/;

  MultiIni.prototype.regExpMultiLineEnd = /^(.*?)"$/;

  MultiIni.prototype.regExpArray = /^(.*?)\[\]$/;

  MultiIni.prototype.STATUS_OK = 0;

  MultiIni.prototype.STATUS_INVALID = 1;

  function MultiIni(options) {
    if (options == null) {
      options = {};
    }
    this.options = _.extend(_.clone(this["default"]), options);
  }

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
    var check, result;
    result = line.match(this.regExpSingleLine);
    if (!result) {
      return false;
    }
    check = result[2].match(/"/g);
    return !check || (check.length % 2 === 0);
  };

  MultiIni.prototype.isMultiLine = function(line) {
    var check, result;
    result = line.match(this.regExpMultiLine);
    if (!result) {
      return false;
    }
    check = result[2].match(/"/g);
    return !check || (check.length % 2 === 0);
  };

  MultiIni.prototype.isMultiLineEnd = function(line) {
    return line.match(this.regExpMultiLineEnd) && !line.match(this.regExpNotEscapedMultiLineEnd);
  };

  MultiIni.prototype.isArray = function(line) {
    return line.match(this.regExpArray);
  };

  MultiIni.prototype.assignValue = function(element, keys, value) {
    var array, current, key, previous, _i, _len;
    value = this.applyFilter(value);
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

  MultiIni.prototype.applyFilter = function(value) {
    var filter, _i, _len, _ref;
    _ref = this.options.filters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      filter = _ref[_i];
      value = filter(value);
    }
    return value;
  };

  MultiIni.prototype.getKeyValue = function(line) {
    var result;
    result = line.match(this.regExpSingleLine);
    if (!this.options.keep_quotes) {
      result[2] = result[2].replace(/^\s*?"(.*?)"\s*?$/, "$1");
    }
    if (result) {
      return [result[1], result[2], this.STATUS_OK];
    }
    throw new Error();
  };

  MultiIni.prototype.getMultiKeyValue = function(line) {
    var result;
    result = line.match(this.regExpMultiLine);
    if (this.options.keep_quotes) {
      result[2] = '"' + result[2];
    }
    if (result) {
      return [result[1], result[2]];
    }
  };

  MultiIni.prototype.getMultiLineEndValue = function(line) {
    var result;
    result = line.match(this.regExpMultiLineEnd);
    if (this.options.keep_quotes) {
      result[1] = result[1] + '"';
    }
    if (result) {
      return [result[1], this.STATUS_OK];
    }
  };

  MultiIni.prototype.getArrayKey = function(line) {
    var result;
    result = line.match(this.regExpArray);
    return result[1];
  };

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
    var ctx, handler, handlers, line, lines, stop, _i, _j, _len, _len1;
    if (filename == null) {
      filename = {};
    }
    lines = this.fetchLines(filename);
    ctx = {
      ini: {},
      current: {},
      multiLineKeys: false,
      multiLineValue: ''
    };
    handlers = [this.handleMultiLine, this.handleComment, this.handleSection, this.handleSingleLine];
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      line = line.trim();
      for (_j = 0, _len1 = handlers.length; _j < _len1; _j++) {
        handler = handlers[_j];
        stop = handler.call(this, ctx, line);
        if (stop) {
          break;
        }
      }
    }
    return ctx.ini;
  };

  MultiIni.prototype.handleMultiLine = function(ctx, line) {
    var key, keys, status, value, _ref, _ref1;
    if (this.isMultiLine(line)) {
      _ref = this.getMultiKeyValue(line), key = _ref[0], value = _ref[1];
      keys = key.split('.');
      ctx.multiLineKeys = keys;
      ctx.multiLineValue = value;
      return true;
    } else if (ctx.multiLineKeys) {
      if (this.isMultiLineEnd(line)) {
        _ref1 = this.getMultiLineEndValue(line), value = _ref1[0], status = _ref1[1];
        if (status === this.STATUS_INVALID && !this.options.oninvalid(line)) {
          return;
        }
        if (status === this.STATUS_INVALID && this.options.ignore_invalid) {
          ctx.multiLineKeys = false;
          ctx.multiLineValue = "";
          return true;
        }
        ctx.multiLineValue += '\n' + value;
        this.assignValue(ctx.current, ctx.multiLineKeys, ctx.multiLineValue);
        ctx.multiLineKeys = false;
        ctx.multiLineValue = "";
        return true;
      } else {
        ctx.multiLineValue += '\n' + line;
        return true;
      }
    }
    return false;
  };

  MultiIni.prototype.handleComment = function(ctx, line) {
    return this.isComment(line);
  };

  MultiIni.prototype.handleSection = function(ctx, line) {
    var section;
    if (!this.isSection(line)) {
      return false;
    }
    section = this.getSection(line);
    if (typeof ctx.ini[section] === 'undefined') {
      ctx.ini[section] = {};
    }
    ctx.current = ctx.ini[section];
    return true;
  };

  MultiIni.prototype.handleSingleLine = function(ctx, line) {
    var key, keys, status, value, _ref;
    if (!this.isSingleLine(line)) {
      return false;
    }
    _ref = this.getKeyValue(line), key = _ref[0], value = _ref[1], status = _ref[2];
    if (status === this.STATUS_INVALID && !this.options.oninvalid(line)) {
      throw new Error('Abort');
    }
    if (status === this.STATUS_INVALID && !this.options.ignore_invalid) {
      return true;
    }
    keys = key.split('.');
    this.assignValue(ctx.current, keys, value);
    return true;
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
