'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

describe("Constants replacement in ini files", function () {
    var MultiIni = require('../src');

    it("Default replacement if constant found", function () {
        var ini = new MultiIni.Class({
          constants: {'CONSTANT': 'replacement'},
          filters: [MultiIni.filters.constants]
        });

        var data = ini.read('test/data/constant.ini');

        expect(data).not.to.be.null;

        expect(data['section']).to.be.defined;

        expect(data['section']['key1']).to.equal('"Part1 replacement"');

        expect(data['section']['key2']).to.equal('"replacement Part2"');

        expect(data['section']['key3']).to.equal('Part1replacementPart2');
    });
});
