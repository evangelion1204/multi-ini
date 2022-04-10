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

-   encoding \[_'utf8'_\] - directly passed to readFileSync
-   keep_quotes \[_false_\] - does not strip quotes around values
-   filters - predefined _lowercase_, _uppercase_, _trim_, _constants_, _boolean_, _integer_
-   nested_section_names \[_false_\] - support to parse section names e.g. `[section.subsection]`
-   keep_zero_prefix \[_false_\] - controls the integer parsing by ignoring numbers with leading 0

### Examples

#### encoding

```js
ini = require('multi-ini');
content = ini.read(file, { encoding: 'utf8' });
content.section.key = value;
ini.write(file, content, { encoding: 'utf8' });
```

#### keep_quotes

This option is by default off to be backward compatible, if you ever need the value containing the quotes then use this.

```ini
key="value"
```

Enabling this option will result in **"value"** instead of **value**.

```js
ini = require('multi-ini');
content = ini.read(file, { keep_quotes: true });
```

This will also affect the Serializer and serialized values. Using it will not quote anything automatically.

```js
{
    production: {
        quoted: '"quoted"',
        not_quoted: 'not_quoted'
    }
}
```

Will result in a ini like

```ini
[production]
quoted="quoted"
not_quotes=not_quoted
```

#### filters

```js
MultiIni = require('multi-ini');
ini = new MultiIni.Class({
    filters: [MultiIni.filters.lowercase],
});
content = ini.read(file);
```

_Replacing constants_

```js
MultiIni = require('multi-ini');
ini = new MultiIni.Class({
    constants: { CONSTANT: 'replacement' },
    filters: [MultiIni.filters.constants],
});
content = ini.read(file);
```

_Define a custom filter_

```js
MultiIni = require('multi-ini');
ini = new MultiIni.Class({
    filters: [
        function (value) {
            return 'Prepend ' + value;
        },
    ],
});
content = ini.read(file);
```

#### line_breaks

Either `unix` or `windows` for line breaks.

```js
ini = require('multi-ini');
content = ini.read(file, { line_breaks: 'windows' });
content.section.key = value;
```

#### nested_section_names

Using `nested_section_names` will parse nested section names having a `.`.

```js
ini = require('multi-ini');
content = ini.read(file, { nested_section_names: true });
```

```ini
[section.subsection]
key="value"
```

Will result in

```json
{
    "section": {
        "subsection": {
            "key": "value"
        }
    }
}
```

#### Parser

It's also possible to parse a ini file from an array of strings.

```js
ini = require('multi-ini');
parser = new ini.Parser();
content = parser.parse(lines);
```

#### Serializer

Like parsing it's also possible to serialize an ini object to a string.

```js
ini = require('multi-ini');
serializer = new ini.Serializer();
content = serializer.serialize({
    production: {
        base_url: 'https://google.com',
    },
});
```

## Changelog

### 2.2.0

-   Support for nested section names
-   filter for integer parsing

### 2.1.2

-   Fixed prototype pollution by ignoring `constructor` and `prototype`

### 2.1.1

-   Fixed prototype pollution by ignoring `__proto__`

### 1.0.1

-   Fixed bug with `keep_quotes` ignored when writing files

### 1.0.0

-   First full release keeping backwards compatibility

### 0.5.2

-   Introduced option for line breaks

### 0.5.1

-   Fixed a bug where single lines of multilines got trimmed

### 0.5.0

-   Added support for filters per value

### 0.4.0

-   Refactoring of the basic implementation to be no longer a singleton
-   Fixed a bug with wrong detected escaped double quotes

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
