'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

describe('Comments', function () {
    var MultiIni = require('../src');
    let comments = null;

    it('Parsing comments', function () {
        var ini = new MultiIni.Class({
            keep_comments:true,
        });

        var data = ini.read('test/data/comment.ini');
        comments = data;

        expect(data).not.to.be.null;

        expect(data[';section1']).to.be.defined;
        expect(data[';section1'].length).to.equal(2);
        expect(data[';section1'][0]).to.equal(' section1 comment');
        expect(data[';section1'][1]).to.equal(' ...');
        expect(data['section1']).to.be.defined;

        expect(data['section1'][';key1'].length).to.equal(1);
        expect(data['section1'][';key1'][0]).to.equal(' key1 comment');
        expect(data['section1']['key1']).to.equal('value1');

        expect(data['section1'][';key2'].length).to.equal(2);
        expect(data['section1'][';key2'][0]).to.equal('multi line comment');
        expect(data['section1'][';key2'][1]).to.equal('  for key2');
        expect(data['section1']['key2']).to.equal('value2');

        expect(data['section1'][';key3'].length).to.equal(4);
        expect(data['section1'][';key3'][0].length).to.equal(0);
        expect(data['section1'][';key3'][1].length).to.equal(1);
        expect(data['section1'][';key3'][1][0]).to.equal(' array comment for key3[1]');
        expect(data['section1'][';key3'][2].length).to.equal(2);
        expect(data['section1'][';key3'][2][0]).to.equal(' array comment');
        expect(data['section1'][';key3'][2][1]).to.equal('  for key3[2]');
        expect(data['section1'][';key3'][3].length).to.equal(0);
        expect(data['section1']['key3'].length).to.equal(4);
        expect(data['section1']['key3'][0]).to.equal('value3-0');
        expect(data['section1']['key3'][1]).to.equal('value3-1');
        expect(data['section1']['key3'][2]).to.equal('value3-2');
        expect(data['section1']['key3'][3]).to.equal('value3-3');

        expect(data['section1']['key4'][';subkey']).to.be.defined;
        expect(data['section1']['key4'][';subkey'].length).to.equal(1);
        expect(data['section1']['key4'][';subkey'][0]).to.equal(' comment for subkey');
        expect(data['section1']['key4']).to.be.defined;
        expect(data['section1']['key4']['subkey']).to.equal('value4');

        expect(data['section1']['key5'][';subkey']).to.be.defined;
        expect(data['section1']['key5'][';subkey'].length).to.equal(2);
        expect(data['section1']['key5'][';subkey'][0].length).to.equal(1);
        expect(data['section1']['key5'][';subkey'][0][0]).to.equal(' array comment for key5.subkey[0]');
        expect(data['section1']['key5'][';subkey'][1].length).to.equal(2);
        expect(data['section1']['key5'][';subkey'][1][0]).to.equal(' array comment');
        expect(data['section1']['key5'][';subkey'][1][1]).to.equal('  for key5.subkey[1]');
        expect(data['section1']['key5']).to.be.defined;
        expect(data['section1']['key5']['subkey']).to.be.defined;
        expect(data['section1']['key5']['subkey'].length).to.equal(2);
        expect(data['section1']['key5']['subkey'][0]).to.equal('value5-0');
        expect(data['section1']['key5']['subkey'][1]).to.equal('value5-1');

        expect(data['section1'][';key6']).to.be.undefined;
        expect(data['section1']['key6']).to.be.defined;
        expect(data['section1']['key6']).to.equal('value6');
    });

    it('Serializing comments', function () {
        var fs = require('fs');
        var ini = new MultiIni.Class({
            keep_comments:true,
        });

        expect(comments).not.to.be.null;

        ini.write('test/out/commented.ini', comments);

        const content = fs.readFileSync('test/out/commented.ini', {encoding: 'utf8'});
        const expectedContent = fs.readFileSync('test/data/comment.ini', {encoding: 'utf8'});

        expect(content).to.equal(expectedContent);
    });

    it('Do not keep reading comments', function () {
        var fs = require('fs');
        var ini = new MultiIni.Class({
            keep_comments:false,
        });

        var data = ini.read('test/data/comment.ini');

        expect(data[';section1']).to.be.undefined;
        expect(data['section1']).to.be.defined;

        expect(data['section1'][';key1']).to.be.undefined;
        expect(data['section1']['key1']).to.equal('value1');

        expect(data['section1'][';key2']).to.be.undefined;
        expect(data['section1']['key2']).to.equal('value2');

        expect(data['section1'][';key3']).to.be.undefined;
        expect(data['section1']['key3'].length).to.equal(4);
        expect(data['section1']['key3'][0]).to.equal('value3-0');
        expect(data['section1']['key3'][1]).to.equal('value3-1');
        expect(data['section1']['key3'][2]).to.equal('value3-2');
        expect(data['section1']['key3'][3]).to.equal('value3-3');

        expect(data['section1']['key4'][';subkey']).to.be.undefined;
        expect(data['section1']['key4']).to.be.defined;
        expect(data['section1']['key4']['subkey']).to.equal('value4');

        expect(data['section1']['key5'][';subkey']).to.be.undefined;
        expect(data['section1']['key5']).to.be.defined;
        expect(data['section1']['key5']['subkey']).to.be.defined;
        expect(data['section1']['key5']['subkey'].length).to.equal(2);
        expect(data['section1']['key5']['subkey'][0]).to.equal('value5-0');
        expect(data['section1']['key5']['subkey'][1]).to.equal('value5-1');

        expect(data['section1'][';key6']).to.be.undefined;
        expect(data['section1']['key6']).to.be.defined;
        expect(data['section1']['key6']).to.equal('value6');
    });

    it('Do not keep writing comments', function () {
        var fs = require('fs');
        var ini = new MultiIni.Class({
            keep_comments:false,
        });

        var data = {
            "section1": {
                "key1": "value1",
                "key2": "value2",
                "key3": [
                    "value3-0",
                    "value3-1",
                    "value3-2",
                    "value3-3"
                ],
                "key4": {
                    "subkey": "value4"
                },
                "key5": {
                    "subkey": [
                        "value5-0",
                        "value5-1"
                    ]
                },
                // intentionally inserted
                ";key6": "value6",
                "key6": "value6"
            }
        };

        ini.write('test/out/comment_free.ini', data);

        const content = fs.readFileSync('test/out/comment_free.ini', {encoding: 'utf8'});
        const expectedContent = fs.readFileSync('test/data/result/comment_free.ini', {encoding: 'utf8'});

        expect(content).to.equal(expectedContent);
    });

});
