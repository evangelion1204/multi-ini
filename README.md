# multi-ini [![Build Status](https://travis-ci.org/evangelion1204/multi-ini.png?branch=master)](https://travis-ci.org/evangelion1204/multi-ini)

An ini-file parser which supports multi line, multiple levels and arrays to get a maximum of compatibility with Zend config files.

## Install

```shell
npm install multi-ini
```

## Usage

```js
ini = require('multi-ini');
content = ini.read(file);
content.section.key = value;
ini.write(file, content);

```

## Options

Following options are available:
* encoding \[*'utf8'*\] - directly passed to readFileSync
* ignore_invalid \[*true*\] - controls if invalid key/values are ignored or processed
* oninvalid - callback function if an invalid key/value is found - return *false* aborts parsing *true* continues

### Examples

#### encoding

```js
ini = require('multi-ini');
content = ini.read(file, {encoding: 'utf8'});
content.section.key = value;
ini.write(file, content, {encoding: 'utf8'});
```

#### ignore_invalid

```js
ini = require('multi-ini');
content = ini.read(file, {ignore_invalid: false});
```

#### oninvalid

```js
cb = function (line) {
    /* do something like logging or output the line which is invalid and abort with false */
    return false
};

ini = require('multi-ini');
content = ini.read(file, {oninvalid: cb});
```