'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

describe("Testing parser", function () {
    var Parser = require('../src/parser');

    it("Availability of the class", function () {
        expect(Parser).not.to.be.undefined;
        expect(Parser).not.to.be.null;
    });

    it("Instantiate with default params", function () {
        var instance = new Parser();

        expect(instance).not.to.be.null;
    });

    describe("getKeyValue", function () {
        var instance = new Parser({keep_quotes: true});

        it("Returning key value not matching", function () {
            var wrapper = function () {
                instance.getKeyValue("key");
            };

            expect(wrapper).to.throw;
        });
    });

    describe("getMultiKeyValue", function () {
        var instance = new Parser({keep_quotes: true});

        it("Returning key value not matching", function () {
            var wrapper = function () {
                instance.getMultiKeyValue("")
            };

            expect(wrapper).to.throw;
        });
    });

    describe("getMultiLineEndValue", function () {
        var instance = new Parser({keep_quotes: true});

        it("Returning key value not matching", function () {
            var wrapper = function () {
                instance.getMultiLineEndValue("")
            };

            expect(wrapper).to.throw;
        });
    });

    describe("handleSection", function () {
        var instance = new Parser({keep_quotes: true});
        it("Same section appears twice", function () {
            var ctx = {ini: {}};

            instance.handleSection(ctx, "[multi]");
            instance.handleSection(ctx, "[another]");
            instance.handleSection(ctx, "[multi]");

            expect(ctx.ini.multi).to.be.defined;
            expect(ctx.ini.another).to.be.defined;
            expect(ctx.current).to.equal(ctx.ini.multi);
        });
    });

    describe("handleSingleLine", function () {
        var instance = new Parser({keep_quotes: true});

        it("", function () {

        });
    });

});
