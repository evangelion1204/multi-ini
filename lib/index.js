var MultiIni, _;

_ = require('lodash');

MultiIni = require('./multi-ini-class');

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
    },
    constants: function(value, options) {
      if (!(_.isString(value) || _.isEmpty(options.constants))) {
        return value;
      }
      _.forIn(options.constants, function(replacement, constant) {
        var matcher;
        matcher = new RegExp("\" " + constant + " \"", 'g');
        value = value.replace(matcher, "" + replacement);
        matcher = new RegExp("\" " + constant + "$", 'g');
        value = value.replace(matcher, "" + replacement + "\"");
        matcher = new RegExp("^" + constant + " \"", 'g');
        return value = value.replace(matcher, "\"" + replacement);
      });
      return value;
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
