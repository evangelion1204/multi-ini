const _ = require('lodash');
const MultiIni = require('./multi-ini-class');

module.exports = {
    Class: MultiIni,

    filters: {
        lowercase: (value) => _.isString(value) ? value.toLowerCase() : value,

        uppercase: (value) => _.isString(value) ? value.toUpperCase() : value,

        trim: (value) => _.isString(value) ? value.trim() : value,

        constants: (value, options) => {
            if (!_.isString(value) || _.isEmpty(options.constants)) {
                return value;
            }

            _.forIn(options.constants, (replacement, constant) => {
                let matcher = new RegExp(`" ${constant} "`, 'g');
                value = value.replace(matcher, `${replacement}`);

                matcher = new RegExp(`" ${constant}$`, 'g');
                value = value.replace(matcher, `${replacement}"`);

                matcher = new RegExp(`^${constant} "`, 'g');
                value = value.replace(matcher, `"${replacement}`);
            });

            return value;
        }
    },

    read: (filename, options = {}) => {
        const instance = new MultiIni(options);
        return instance.read(filename);
    },

    write: (filename, content, options = {}) => {
        const instance = new MultiIni(options);
        return instance.write(filename, content);
    },
};
