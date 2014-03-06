module.exports = exports  = (function() {
    var fs = require('fs');
    
    return {
        regExpSection: /^\s*\[(.*?)\]\s*$/,
        regExpComment: /^;.*$/,
        regExpSimpleSingleLine: /\s*(.*?)\s*?=\s*?(.*?)$/,
        regExpQuotedSingleLine: /\s*(.*?)\s*?=\s*?"(.*?)"$/,
        regExpMultiLine: /\s*(.*?)\s*?=\s*?"(.*?)$/,
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
        fetchLines: function (filename) {
            var content = fs.readFileSync(filename, {encoding: 'utf8'});
            return content.split('\r\n');            
        },
        read: function(filename) {
            var lines = this.fetchLines(filename);
            var ini = {},
                current = ini;
            
            for (index in lines) {
                var line = lines[index];
                
                if (this.isSection(line)) {
                    console.log('section');
                    var section = this.getSection(line);
                    
                    if (typeof ini[section] == 'undefined') {
                        ini[section] = {};                       
                    }
                    current = ini[section];
                }
                
                if (this.isComment(line))
                    console.log('comment');
                
                if (this.isSingleLine(line)) {
                    console.log('single');
                    
                    var keyValue = this.getKeyValue(line),
                        key = keyValue[0],
                        value = keyValue[1];
                
                    current[key] = value;
                }
            }
            
            return ini;
        }
    };
})();