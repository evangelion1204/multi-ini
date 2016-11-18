'use strict';

const _ = require('lodash');

export function lowercase(value) {
    return _.isString(value) ? value.toLowerCase() : value;
}

export function uppercase(value) {
    return _.isString(value) ? value.toUpperCase() : value;
}

export function trim(value) {
    return  _.isString(value) ? value.trim() : value;
}

export function constants(value, options) {
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
