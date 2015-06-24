describe("Testing parser", function () {
    var Parser = require('../lib/parser.js');

    it("Availability of the class", function () {
        expect(Parser).not.toBeUndefined();
        expect(Parser).not.toBeNull();
    });

    it("Instantiate with default params", function () {
        var instance = new Parser();

        expect(instance).not.toBeNull();
    });

    describe("getKeyValue", function () {
        var instance = new Parser({keep_quotes: true});

        it("Returning key value not matching", function () {
            var wrapper = function () {
                instance.getKeyValue("key");
            };

            expect(wrapper).toThrow();
        });
    });

    describe("getMultiKeyValue", function () {
        var instance = new Parser({keep_quotes: true});

        it("Returning key value not matching", function () {
            var wrapper = function () {
                instance.getMultiKeyValue("")
            };

            expect(wrapper).toThrow();
        });
    });

    describe("getMultiLineEndValue", function () {
        var instance = new Parser({keep_quotes: true});

        it("Returning key value not matching", function () {
            var wrapper = function () {
                instance.getMultiLineEndValue("")
            };

            expect(wrapper).toThrow();
        });
    });

});