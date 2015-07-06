describe("Basic testing includes reading of different files", function () {
    var fs = require('fs');
    var MultiIni = require('../lib/multi-ini-class.js');

    it("Availability of the class ", function () {
        expect(MultiIni).not.toBeUndefined();
        expect(MultiIni).not.toBeNull();
    });

    it("Read a basic with a section and 2 simple keys and a comment", function () {
        var ini = new MultiIni.Class();

        var data = ini.read('test/data/single.ini');

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();

        expect(data['section1']['key1']).toBe('value1');

        expect(data['section1']['key2']).toBe('value2');

        expect(data['section1']['key3']).toBe('value3');

        expect(data['section1']['key4']).toBe('value4');

        expect(data['section1']['key5']).toBe('value5');

        expect(data['section1']['key6']).toBe('value6');

        expect(data['section1']['key7']).toBe(' value7');

        expect(data['section1']['key8']).toBe('VALUE8');
    });

    it("Read a basic with a section with multi line values", function () {
        var ini = new MultiIni.Class();
        var data = ini.read('test/data/multi_line.ini');

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();

        // test first value
        expect(data['section1']['key1']).toBe('value1');

        // multi line parsing should stop to fetch key5
        expect(data['section1']['key5']).toBe('value5');

        expect(data['section1']['key2']).toBe('line1\nline2');

        expect(data['section1']['key3']).toBe('\nline2\nline3');

        expect(data['section1']['key4']).toBe('\nline2\nline3\n');

        expect(data['section1']['key6']).toBe('\nline1\nline2=dummy\n');

        expect(data['section1']['key7']).toBe('line1\n  line2\n    line3');
    });

    it("Read a basic with a section with multi level keys and single and multi line values", function () {
        var ini = new MultiIni.Class();
        var data = ini.read('test/data/multi_level_line.ini');

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();

        // check for the second level
        expect(data['section1']['key1']).toBeDefined();
        expect(data['section1']['key1']['subkey1']).toBe('value1');
        expect(data['section1']['key1']['subkey2']).toBe('value2');

        // check the third level
        expect(data['section1']['key2']).toBeDefined();
        expect(data['section1']['key2']['subkey1']['subkey1']).toBe('value3');
        expect(data['section1']['key2']['subkey1']['subkey2']).toBe('value4');

        expect(data['section1']['key2']['subkey2']).toBe('value5');

        expect(data['section1']['key2']['subkey3']).toBeDefined();
        expect(data['section1']['key2']['subkey3']['subkey1']).toBe('value6');

        // multi line parsing with second level
        expect(data['section1']['key3']).toBeDefined();
        expect(data['section1']['key3']['subkey1']).toBe('line1\nline2');
        expect(data['section1']['key3']['subkey2']).toBe('\nline2\nline3');
        expect(data['section1']['key3']['subkey3']).toBe('\nline2\nline3\n');

        // multi line parsing with third level
        expect(data['section1']['key4']).toBeDefined();
        expect(data['section1']['key4']['subkey1']).toBeDefined();
        expect(data['section1']['key4']['subkey1']['subkey1']).toBe('line1\nline2');
        expect(data['section1']['key4']['subkey1']['subkey2']).toBe('\nline2\nline3');
        expect(data['section1']['key4']['subkey1']['subkey3']).toBe('\nline2\nline3\n');

        expect(data['section1']['key4']['subkey2']).toBe('value');
    });

    it("Read ini with array definitions", function () {
        var ini = new MultiIni.Class();
        var data = ini.read('test/data/array.ini');

        expect(data).not.toBeNull();
        expect(data['section1']).toBeDefined();

        // array in key
        expect(data['section1']['key1']).toBeDefined();
        expect(data['section1']['key1'].length).toBe(2);
        expect(data['section1']['key1'][0]).toBe('value1');
        expect(data['section1']['key1'][1]).toBe('value2');

        // normal key value
        expect(data['section1']['key2']).toBe('value3');

        // array in subkey
        expect(data['section1']['key3']).toBeDefined();
        expect(data['section1']['key3']['subkey']).toBeDefined();
        expect(data['section1']['key3']['subkey'].length).toBe(2);
        expect(data['section1']['key3']['subkey'][0]).toBe('value4');
        expect(data['section1']['key3']['subkey'][1]).toBe('value5');
    });

    it("Write ini file with one section and multiple single line values", function () {
        var data = {
            section1: {
                key1: 'value1',
                key2: 'value2'
            }
        };

        var ini = new MultiIni.Class();
        ini.write('test/out/single.ini', data);

        var content = fs.readFileSync('test/out/single.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/single.ini', {encoding: 'utf8'});

        expect(content).toBe(expectedContent);
    });

    it("Write ini file with one section and multiple multi level single line values", function () {
        var data = {
            section1: {
                key1: {
                    subkey1: 'value1',
                    subkey2: 'value2'
                },
                key2: {
                    subkey: 'value3'
                }
            }
        };

        var ini = new MultiIni.Class();
        ini.write('test/out/multi_level.ini', data);

        var content = fs.readFileSync('test/out/multi_level.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/multi_level.ini', {encoding: 'utf8'});

        expect(content).toBe(expectedContent);
    });

    it("Write a file with single and multi level and array definitions", function () {
        var data = {
            section1: {
                key1: {
                    subkey1: ['value1', 'value2'],
                    subkey2: 'value3'
                },
                key2: ['value4', 'value5']
            }
        };

        var ini = new MultiIni.Class();
        ini.write('test/out/array.ini', data);

        var content = fs.readFileSync('test/out/array.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/array.ini', {encoding: 'utf8'});

        expect(content).toBe(expectedContent);
    });

    it("Write a file with single and multi level with multi line", function () {
        var data = {
            section1: {
                key1: {
                    subkey1: 'line1\nline2',
                    subkey2: '\nline2',
                    subkey3: '\nline2\n',
                    subkey4: 'value1'
                },
                key2: 'line1\nline2',
                key3: '\nline2',
                key4: '\nline2\n',
                key5: 'value2'
            }
        };

        var ini = new MultiIni.Class();
        ini.write('test/out/multi_line.ini', data);

        var content = fs.readFileSync('test/out/multi_line.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/multi_line.ini', {encoding: 'utf8'});

        expect(content).toBe(expectedContent);
    });

    it("Write a file with single and multi level, multi line and array", function () {
        var data = {
            section1: {
                key1: {
                    subkey1: ['line1\nline2', '\nline2', '\nline2\n', 'value1'],
                    subkey2: 'value2'
                },
                key2: ['line1\nline2', '\nline2', '\nline2\n', 'value3'],
                key3: 'value4'
            }
        };

        var ini = new MultiIni.Class();
        ini.write('test/out/all.ini', data);

        var content = fs.readFileSync('test/out/all.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/all.ini', {encoding: 'utf8'});

        expect(content).toBe(expectedContent);
    });

    it("Write a ascii ini file and write it manuel", function () {
        var ini = new MultiIni.Class({encoding: 'ascii'});
        var data = {
            section: {
                key: "Straße mit Häusern"
            }
        };

        ini.write('test/out/ascii.ini', data);
        fs.writeFileSync('test/out/ascii_serialized.ini', ini.serialize(data), {encoding: 'ascii'});


        var content = fs.readFileSync('test/out/ascii.ini', {encoding: 'ascii'});
        var expectedContent = fs.readFileSync('test/out/ascii_serialized.ini', {encoding: 'ascii'});

        expect(content).toBe(expectedContent);
    });

//    it("Compare both reading results, via ini and manuel", function () {
//        var data = {
//            section: {
//                key: "Straße mit Häusern"
//            }
//        };
//
//        MultiIni.write('test/out/ascii_read_write.ini', data, {encoding: 'ascii'});
//
//        var content = MultiIni.read('test/out/ascii_read_write.ini', {encoding: 'ascii'});
//
//        expect(content.section.key).toBe(data.section.key);
//    });

//    it("Read a file with an invalid lines ignoring it", function () {
//        var data = MultiIni.read('test/data/invalid_line.ini')
//
//        expect(data).not.toBeNull();
//
//        expect(data['section']).toBeDefined();
//
//        expect(data['section']['valid']).toBe('valid');
//
//        expect(data['section']['invalid']).not.toBeDefined();
//
//        expect(data['section']['invalid_multiline']).not.toBeDefined();
//    });
//
//    it("Read a file with an invalid lines reading it", function () {
//        var data = MultiIni.read('test/data/invalid_line.ini', {ignore_invalid: false})
//
//        expect(data).not.toBeNull();
//
//        expect(data['section']).toBeDefined();
//
//        expect(data['section']['valid']).toBe('valid');
//
//        expect(data['section']['invalid']).toBe('invalid');
//
//        expect(data['section']['invalid_multiline']).toBe('line1\nline2\nline3');
//    });
//
//    it("Read a file with an invalid with invalid callback and abort", function () {
//        var cb = function (line) {
//            expect(line).toBe('invalid="invalid"a')
//            return false
//        };
//        var data = MultiIni.read('test/data/invalid_line.ini', {ignore_invalid: false, oninvalid: cb})
//
//        expect(data).toBeUndefined();
//    });

    it("Read a basic file with a section and 2 simple keys and one multiline with keep quotes", function () {
        var ini = new MultiIni.Class({keep_quotes: true});
        var data = ini.read('test/data/combined_keep_quotes.ini');

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();

        expect(data['section1']['key1']).toBe('"value1"');

        expect(data['section1']['multiline']).toBe('"line1\nline2\nline3\n"');

        expect(data['section1']['key2']).toBe('value2');
    });

    it("Read a basic file with a section and 2 simple keys and one multiline with keep quotes and writing it", function () {
        var ini = new MultiIni.Class({keep_quotes: true});
        var data = ini.read('test/data/combined_keep_quotes.ini');

        MultiIni.write('test/out/combined_keep_quotes.ini', data);

        var content = fs.readFileSync('test/out/combined_keep_quotes.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/combined_keep_quotes.ini', {encoding: 'utf8'});

        expect(content).toBe(expectedContent);
    });

    it("Read and writing a file with constants", function () {
        var ini = new MultiIni.Class();
        var data = ini.read('test/data/constant.ini');

        expect(data).not.toBeNull();

        expect(data['section']).toBeDefined();

        expect(data['section']['key1']).toBe('"Part1" CONSTANT');

        expect(data['section']['key2']).toBe('CONSTANT "Part2"');

        expect(data['section']['key3']).toBe('Part1" CONSTANT "Part2');

        MultiIni.write('test/out/constant.ini', data);
    });

    it("Read and writing a file with constants with keeping quotes", function () {
        var ini = new MultiIni.Class({keep_quotes: true});
        var data = ini.read('test/data/constant.ini');

        expect(data).not.toBeNull();

        expect(data['section']).toBeDefined();

        expect(data['section']['key1']).toBe('"Part1" CONSTANT');

        expect(data['section']['key2']).toBe('CONSTANT "Part2"');

        expect(data['section']['key3']).toBe('"Part1" CONSTANT "Part2"');

        MultiIni.write('test/out/constant_keep.ini', data);
    });

    it("Read a file with a section with values having escaped quotes", function () {
        var ini = new MultiIni.Class();
        var data = ini.read('test/data/escaped_quotes.ini');

        MultiIni.write('test/out/escaped_quotes.ini', data);

        var content = fs.readFileSync('test/out/escaped_quotes.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/escaped_quotes.ini', {encoding: 'utf8'});

        expect(content).toBe(expectedContent);
    });

    it("Apply uppercase filter", function () {
        var ini = new MultiIni.Class({
            filters: [MultiIni.filters.uppercase]
        });
        var data = ini.read('test/data/single.ini');

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();
        expect(data['section1']['key1']).toBe('VALUE1');
        expect(data['section1']['key8']).toBe('VALUE8');
    });

    it("Apply lowercase filter", function () {
        var ini = new MultiIni.Class({
            filters: [MultiIni.filters.lowercase]
        });
        var data = ini.read('test/data/single.ini');

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();
        expect(data['section1']['key1']).toBe('value1');
        expect(data['section1']['key8']).toBe('value8');
    });

    it("Apply trim empty lines filter", function () {
        var ini = new MultiIni.Class({
            filters: [MultiIni.filters.trim]
        });
        var data = ini.read('test/data/multi_line.ini');

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();
        expect(data['section1']['key4']).toBe('line2\nline3');
    });

    it("Read multi line ini of issue #12 with windows line breaks", function () {
        var instance = new MultiIni.Class({line_breaks: 'windows'})
        var data = instance.read('test/data/issue_12.ini');

        expect(data['(U+Pu) métal H2O']['description']).toBe('(U+Pu) métal modération H2O\nParamétrage de la modération en H/(U+Pu)');
    });
});