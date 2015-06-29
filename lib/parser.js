var Parser;

Parser = (function() {
  Parser.prototype.regExpSection = /^\s*\[(.*?)\]\s*$/;

  Parser.prototype.regExpComment = /^;.*/;

  Parser.prototype.regExpSingleLine = /^\s*(.*?)\s*?=\s*?(\S.*?)$/;

  Parser.prototype.regExpMultiLine = /^\s*(.*?)\s*?=\s*?"(.*?)$/;

  Parser.prototype.regExpNotEscapedMultiLineEnd = /^(.*?)\\"$/;

  Parser.prototype.regExpMultiLineEnd = /^(.*?)"$/;

  Parser.prototype.regExpArray = /^(.*?)\[\]$/;

  Parser.prototype.STATUS_OK = 0;

  Parser.prototype.STATUS_INVALID = 1;

  function Parser(options) {
    if (options == null) {
      options = {};
    }
    this.options = options;
    this.handlers = [this.handleMultiLineStart, this.handleMultiLineEnd, this.handleMultiLineAppend, this.handleComment, this.handleSection, this.handleSingleLine];
  }

  Parser.prototype.parse = function(lines) {
    var ctx, handler, line, stop, _i, _j, _len, _len1, _ref;
    ctx = {
      ini: {},
      current: {},
      multiLineKeys: false,
      multiLineValue: ''
    };
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      _ref = this.handlers;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        handler = _ref[_j];
        stop = handler.call(this, ctx, line);
        if (stop) {
          break;
        }
      }
    }
    return ctx.ini;
  };

  Parser.prototype.isSection = function(line) {
    return line.match(this.regExpSection);
  };

  Parser.prototype.getSection = function(line) {
    return line.match(this.regExpSection)[1];
  };

  Parser.prototype.isComment = function(line) {
    return line.match(this.regExpComment);
  };

  Parser.prototype.isSingleLine = function(line) {
    var check, result;
    result = line.match(this.regExpSingleLine);
    if (!result) {
      return false;
    }
    check = result[2].match(/"/g);
    return !check || (check.length % 2 === 0);
  };

  Parser.prototype.isMultiLine = function(line) {
    var check, result;
    result = line.match(this.regExpMultiLine);
    if (!result) {
      return false;
    }
    check = result[2].match(/"/g);
    return !check || (check.length % 2 === 0);
  };

  Parser.prototype.isMultiLineEnd = function(line) {
    return line.match(this.regExpMultiLineEnd) && !line.match(this.regExpNotEscapedMultiLineEnd);
  };

  Parser.prototype.isArray = function(line) {
    return line.match(this.regExpArray);
  };

  Parser.prototype.assignValue = function(element, keys, value) {
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

  Parser.prototype.applyFilter = function(value) {
    var filter, _i, _len, _ref;
    _ref = this.options.filters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      filter = _ref[_i];
      value = filter(value);
    }
    return value;
  };

  Parser.prototype.getKeyValue = function(line) {
    var result;
    result = line.match(this.regExpSingleLine);
    if (!result) {
      throw new Error();
    }
    if (!this.options.keep_quotes) {
      result[2] = result[2].replace(/^\s*?"(.*?)"\s*?$/, "$1");
    }
    return [result[1], result[2], this.STATUS_OK];
  };

  Parser.prototype.getMultiKeyValue = function(line) {
    var result;
    result = line.match(this.regExpMultiLine);
    if (!result) {
      throw new Error();
    }
    if (this.options.keep_quotes) {
      result[2] = '"' + result[2];
    }
    return [result[1], result[2]];
  };

  Parser.prototype.getMultiLineEndValue = function(line) {
    var result;
    result = line.match(this.regExpMultiLineEnd);
    if (!result) {
      throw new Error();
    }
    if (this.options.keep_quotes) {
      result[1] = result[1] + '"';
    }
    return [result[1], this.STATUS_OK];
  };

  Parser.prototype.getArrayKey = function(line) {
    var result;
    result = line.match(this.regExpArray);
    return result[1];
  };

  Parser.prototype.handleMultiLineStart = function(ctx, line) {
    var key, keys, value, _ref;
    if (!this.isMultiLine(line.trim())) {
      return false;
    }
    _ref = this.getMultiKeyValue(line), key = _ref[0], value = _ref[1];
    keys = key.split('.');
    ctx.multiLineKeys = keys;
    ctx.multiLineValue = value;
    return true;
  };

  Parser.prototype.handleMultiLineEnd = function(ctx, line) {
    var status, value, _ref;
    if (!ctx.multiLineKeys || !this.isMultiLineEnd(line.trim())) {
      return false;
    }
    _ref = this.getMultiLineEndValue(line), value = _ref[0], status = _ref[1];
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
  };

  Parser.prototype.handleMultiLineAppend = function(ctx, line) {
    if (!ctx.multiLineKeys || this.isMultiLineEnd(line.trim())) {
      return false;
    }
    ctx.multiLineValue += '\n' + line;
    return true;
  };

  Parser.prototype.handleComment = function(ctx, line) {
    return this.isComment(line.trim());
  };

  Parser.prototype.handleSection = function(ctx, line) {
    var section;
    line = line.trim();
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

  Parser.prototype.handleSingleLine = function(ctx, line) {
    var key, keys, status, value, _ref;
    line = line.trim();
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

  return Parser;

})();

module.exports = Parser;
