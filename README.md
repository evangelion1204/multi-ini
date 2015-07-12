# multi-ini [![Build Status](https://travis-ci.org/evangelion1204/multi-ini.png?branch=master)](https://travis-ci.org/evangelion1204/multi-ini) [![Coverage Status](https://coveralls.io/repos/evangelion1204/multi-ini/badge.svg?branch=master)](https://coveralls.io/r/evangelion1204/multi-ini?branch=master)

[![Join the chat at https://gitter.im/evangelion1204/multi-ini](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/evangelion1204/multi-ini?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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
* keep_quotes \[*false*\] - does not strip quotes around values
* filters - predefined *lowercase*, *uppercase*, *trim* 

### Examples

#### encoding

```js
ini = require('multi-ini');
content = ini.read(file, {encoding: 'utf8'});
content.section.key = value;
ini.write(file, content, {encoding: 'utf8'});
```

#### keep_quotes
This option is by default off to be backward compatible, if you ever need the value containing the quotes then use this.
```ini
key="value"
```
Enabling this option will result in **"value"** instead of **value**.

```js
ini = require('multi-ini');
content = ini.read(file, {keep_quotes: false});
```

#### filters

```js
MultiIni = require('multi-ini');
ini = new MultiIni.Class({
    filters: [MultiIni.filters.lowercase]
});
content = ini.read(file);
```

*Define a custom filter*
```js
MultiIni = require('multi-ini');
ini = new MultiIni.Class({
    filters: [
        function (value) {
            return "Prepend " + value;
        }
    ]
});
content = ini.read(file);
```

#### line_breaks

Either `unix` or `windows` for line breaks.

```js
ini = require('multi-ini');
content = ini.read(file, {line_breaks: 'windows'});
content.section.key = value;
```

## Changelog

### 0.5.2
* Introduced option for line breaks

### 0.5.1
* Fixed a bug where single lines of multilines got trimmed

### 0.5.0
* Added support for filters per value

### 0.4.0
* Refactoring of the basic implementation to be no longer a singleton
* Fixed a bug with wrong detected escaped double quotes

### 0.2.5
Now correctly reads
```ini
key= example
```
to the value "**example**" instead of "** example**"

### 0.2.4
Implemented support for constants and removed a lot of bugs and the options **ignore_invalid** and **oninvalid**, this may be introduced again but are currently not necessary.

### 0.2.3
Fixed a bug that the module was not recognized as a module by Node.