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
* keep_quotes \[*false*\] - does not strip quotes around values

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

## Changelog

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