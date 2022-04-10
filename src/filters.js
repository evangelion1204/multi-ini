'use strict';

const _ = require('lodash');

export function lowercase(value) {
    return _.isString(value) ? value.toLowerCase() : value;
}

export function uppercase(value) {
    return _.isString(value) ? value.toUpperCase() : value;
}

export function trim(value) {
    return _.isString(value) ? value.trim() : value;
}

export function constants(value, options = {}) {
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

export function boolean(value) {
    if (!_.isString(value) || value.length > 5) {
        return value;
    }

    switch (value.toLowerCase()) {
        case 'on':
        case 'yes':
        case 'true':
            return true;
        case 'off':
        case 'no':
        case 'none':
        case 'false':
            return false;
        default:
            return value;
    }
}

export function integer(value, options = {}) {
    if (
        isNaN(value) ||
        isNaN(parseInt(value, 10)) ||
        (options.keep_zero_prefix && value.length > 1 && value[0] === '0') // dont drop zero prefixes
    ) {
        return value;
    }

    return parseInt(value, 10);
}
