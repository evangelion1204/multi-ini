'use strict';

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

describe("Filters", function () {
    var MultiIni = require('../src');

    it("Availability of the filters", function () {
        expect(MultiIni.filters).not.to.be.undefined;
        expect(MultiIni.filters).not.to.be.null;
    });
});
