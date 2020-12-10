'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

describe('Testing security', function () {
    const MultiIni = require('../src/multi-ini-class');

    it('Secure keys to fix prototype pollution', function () {
        var ini = new MultiIni();

        var data = ini.read('test/data/prototype_pollution.ini');

        expect(data).not.to.be.null;

        expect(data['test']).to.be.defined;
        expect(data['test']['value']).to.equal('key');

        expect(data['__proto__']['polluted']).to.be.undefined;
        expect({}.__proto__.polluted).to.be.undefined;
        expect(typeof polluted).to.equal('undefined');

        expect(data['__proto__']['path_polluted']).to.be.undefined;
        expect({}.__proto__.path_polluted).to.be.undefined;
        expect(typeof path_polluted).to.equal('undefined');

        console.log(data);
    });
});
