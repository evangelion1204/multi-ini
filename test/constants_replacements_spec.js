describe("Constants replacement in ini files", function () {
    var MultiIni = require('../lib');

    it("Default replacement if constant found", function () {
        var ini = new MultiIni.Class({constants: {'CONSTANT': 'replacement'}});

        var data = ini.read('test/data/constant.ini');

        expect(data).not.toBeNull();

        expect(data['section']).toBeDefined();

        expect(data['section']['key1']).toBe('"Part1 replacement"');

        expect(data['section']['key2']).toBe('"replacement Part2"');

        expect(data['section']['key3']).toBe('Part1replacementPart2');
    });
});