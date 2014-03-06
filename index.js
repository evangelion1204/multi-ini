module.exports = (function() {
    var fs = require('fs');
    
    return {
        regExpSection: /^\s*\[(.*?)\]\s*$/,
        regExpComment: /^;.*/,
        regExpSimpleSingleLine: /^\s*(.*?)\s*?=\s*?[^"](.*?)$/,
        regExpQuotedSingleLine: /^\s*(.*?)\s*?=\s*?"(.*?)"$/,
        regExpMultiLine: /^\s*(.*?)\s*?=\s*?"(.*?)$/,
        regExpMultiLineEnd: /^(.*?)"$/,
        regExpArray: /^(.*?)\[\]$/,

        isSection: function(line) {
            return line.match(this.regExpSection);
        },
        getSection: function(line) {
            return line.match(this.regExpSection)[1];
        },
        isComment: function(line) {
            return line.match(this.regExpComment);
        },
        isSingleLine: function(line) {
            return line.match(this.regExpQuotedSingleLine) || line.match(this.regExpSimpleSingleLine);
        },
        isMultiLine: function(line) {
            return line.match(this.regExpMultiLine);
        },
        isMultiLineEnd: function(line) {
            return line.match(this.regExpMultiLineEnd);
        },
        isArray: function(line) {
            return line.match(this.regExpArray);
        },
        assignValue: function(element, keys, value) {
            var current = element,
                previous = element,
                key, array = false;

            for (index in keys) {
                key = keys[index];

                if (this.isArray(key)) {
                    key = this.getArrayKey(key);
                    array = true;
                }

                if (!current[key]) {
                    current[key] = array?[]:{};
                }

                previous = current;
                current = current[key];
            }

            if (array) {
                current.push(value);
            }
            else {
                previous[key] = value;
            }

            return element;
        },
        getKeyValue: function(line) {
            var result;
            result = line.match(this.regExpQuotedSingleLine);
            
            if (result) {
                return [result[1], result[2]];
            }
            result = line.match(this.regExpSimpleSingleLine);
            if (result) {
                return [result[1], result[2]];
            }
            
            throw new Error();
        },
        getMultiKeyValue: function(line) {
            var result;
            result = line.match(this.regExpMultiLine);

            if (result) {
                return [result[1], result[2]];
            }
        },
        getMultiLineEndValue: function(line) {
            var result;
            result = line.match(this.regExpMultiLineEnd);

            if (result) {
                return result[1];
            }
        },
        getArrayKey: function(line) {
            var result = line.match(this.regExpArray);
            return result[1];
        },
        fetchLines: function (filename) {
            var content = fs.readFileSync(filename, {encoding: 'utf8'});
            return content.split('\n');
        },
        read: function(filename) {
            var lines = this.fetchLines(filename);
            var ini = {},
                current = ini,
                multiLineKeys = false, multiLineValue;
            
            for (index in lines) {
                var line = lines[index];

                if (this.isComment(line)) {
//                    console.log('comment');
                }
                else if (this.isSection(line)) {
//                    console.log('section');
                    var section = this.getSection(line);
                    
                    if (typeof ini[section] == 'undefined') {
                        ini[section] = {};                       
                    }
                    current = ini[section];
                }
                else if (this.isSingleLine(line)) {
                    var keyValue = this.getKeyValue(line),
                        key = keyValue[0],
                        value = keyValue[1],
                        keys = key.split('.');

                    this.assignValue(current, keys, value);
                }
                else if (this.isMultiLine(line)) {
                    var keyValue = this.getMultiKeyValue(line),
                        key = keyValue[0],
                        value = keyValue[1],
                        keys = key.split('.');

                    multiLineKeys = keys;
                    multiLineValue = value;
                }
                else if (multiLineKeys) {
                    if (this.isMultiLineEnd(line)) {
                        multiLineValue += '\n' + this.getMultiLineEndValue(line);
                        this.assignValue(current, multiLineKeys, multiLineValue);

                        multiLineKeys = false;
                        multiLineValue = "";
                    }
                    else {
                        multiLineValue += '\n' + line;
                    }
                }
            }
            
            return ini;
        },
        write: function (filename, content) {
            fs.writeFileSync(filename, content, {encoding: 'utf8'});
        }
    };
})();
