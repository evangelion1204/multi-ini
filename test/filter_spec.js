'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

describe("Filters", function () {
    var MultiIni = require('../src');

    it("Availability of the filters", function () {
        expect(MultiIni.filters).not.to.be.undefined;
        expect(MultiIni.filters).not.to.be.null;
    });

    describe("lowercase", function () {
        it("is available", function () {
            expect(MultiIni.filters.lowercase).to.be.defined;
        });

        it("string should be lowercase", function () {
            expect(MultiIni.filters.lowercase('Test')).to.equal('test');
        });

        it("anything else then string will be returned unmodified", function () {
            expect(MultiIni.filters.lowercase(false)).to.equal(false);
        });
    });

    describe("uppercase", function () {
        it("is available", function () {
            expect(MultiIni.filters.uppercase).to.be.defined;
        });

        it("string should be uppercase", function () {
            expect(MultiIni.filters.uppercase('Test')).to.equal('TEST');
        });

        it("anything else then string will be returned unmodified", function () {
            expect(MultiIni.filters.uppercase(false)).to.equal(false);
        });
    });

    describe("trim", function () {
        it("is available", function () {
            expect(MultiIni.filters.trim).to.be.defined;
        });

        it("string should be trimmed", function () {
            expect(MultiIni.filters.trim(' Test ')).to.equal('Test');
        });

        it("anything else then string will be returned unmodified", function () {
            expect(MultiIni.filters.trim(false)).to.equal(false);
        });
    });

    describe("constants", function () {
        it("is available", function () {
            expect(MultiIni.filters.constants).to.be.defined;
        });

        it("string should have replaced constants", function () {
            const options = {constants: {CONSTANT: 'replaced'}};

            expect(MultiIni.filters.constants('"Test " CONSTANT', options)).to.equal('"Test replaced"');
            expect(MultiIni.filters.constants('"Test " CONSTANT " Test"', options)).to.equal('"Test replaced Test"');
            expect(MultiIni.filters.constants('CONSTANT " Test"', options)).to.equal('"replaced Test"');
        });

        it("anything else then string will be returned unmodified", function () {
            expect(MultiIni.filters.constants(false)).to.equal(false);
        });
    });

});
