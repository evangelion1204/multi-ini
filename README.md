# multi-ini [![Build Status](https://travis-ci.org/evangelion1204/multi-ini.png?branch=master)](https://travis-ci.org/evangelion1204/multi-ini)

Read multi-level and multi-line ini-files which compatibility to Zend.

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
