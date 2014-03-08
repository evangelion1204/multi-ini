describe("Basic testing includes reading of different files", function() {
    var MultiIni = require('../src/multi-ini.js');

    it("Availability of the class ", function() {
        expect(MultiIni).not.toBeUndefined();
        expect(MultiIni).not.toBeNull();
    });

    it("Read a basic with a section and 2 simple keys and a comment", function () {
        var data = MultiIni.read('test/data/single.ini')

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();

        expect(data['section1']['key1']).toBe('value1');

        expect(data['section1']['key2']).toBe('value2');
    });

    it("Read a basic with a section with multi line values", function () {
        var data = MultiIni.read('test/data/multi_line.ini');

        expect(data).not.toBeNull();

        expect(data['section1']).toBeDefined();

        // test first value
        expect(data['section1']['key1']).toBe('value1');

        // multi line parsing should stop to fetch key5
        expect(data['section1']['key5']).toBe('value5');

        expect(data['section1']['key2']).toBe('line1\nline2');

        expect(data['section1']['key3']).toBe('\nline2\nline3');

        expect(data['section1']['key4']).toBe('\nline2\nline3\n');
    });

    it("Read a basic with a section with multi level keys and single and multi line values", function () {
        var data = MultiIni.read('test/data/multi_level_line.ini');

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
        var data = MultiIni.read('test/data/array.ini');

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

});