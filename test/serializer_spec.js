'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

describe('Testing serializer', function () {
    var Serializer = require('../src/serializer');

    it('Availability of the class', function () {
        expect(Serializer).not.to.be.undefined;
        expect(Serializer).not.to.be.null;
    });

    it('Instantiate with default params', function () {
        var instance = new Serializer();

        expect(instance).not.to.be.null;
    });
    
    it('serialize should return a correct string with quoted keys', function () {
       var instance = new Serializer();

        expect(instance.serialize({
            production: {
                key: 'value'
            }
        })).to.be.equal('[production]\nkey="value"\n');
    });

    it('serialize with keep_quotes should return a correct string with and without quotes', function () {
        var instance = new Serializer({keep_quotes: true});

        expect(instance.serialize({
            production: {
                quoted: '"quoted"',
                not_quoted: 'not_quoted'
            }
        })).to.be.equal('[production]\nquoted="quoted"\nnot_quoted=not_quoted\n');
    });
});
