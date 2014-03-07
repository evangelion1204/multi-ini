multi-ini
=========

Read multilevel and multiline ini files in compatible with Zend.

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
