'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

describe("Basic testing with backward compatibility to pre 0.3.x", function () {
    var fs = require('fs');
    var MultiIni = require('../src');

    it("Read a basic with a section and 2 simple keys and a comment", function () {
        var data = MultiIni.read('test/data/single.ini');

        expect(data).not.to.be.null;

        expect(data['section1']).to.be.defined;

        expect(data['section1']['key1']).to.equal('value1');

        expect(data['section1']['key2']).to.equal('value2');

        expect(data['section1']['key3']).to.equal('value3');

        expect(data['section1']['key4']).to.equal('value4');

        expect(data['section1']['key5']).to.equal('value5');

        expect(data['section1']['key6']).to.equal('value6');

        expect(data['section1']['key7']).to.equal(' value7');
    });

    it("Read a basic with a section with multi line values", function () {
        var data = MultiIni.read('test/data/multi_line.ini');

        expect(data).not.to.be.null;

        expect(data['section1']).to.be.defined;

        // test first value
        expect(data['section1']['key1']).to.equal('value1');

        // multi line parsing should stop to fetch key5
        expect(data['section1']['key5']).to.equal('value5');

        expect(data['section1']['key2']).to.equal('line1\nline2');

        expect(data['section1']['key3']).to.equal('\nline2\nline3');

        expect(data['section1']['key4']).to.equal('\nline2\nline3\n');
    });

    it("Read a basic with a section with multi level keys and single and multi line values", function () {
        var data = MultiIni.read('test/data/multi_level_line.ini');

        expect(data).not.to.be.null;

        expect(data['section1']).to.be.defined;

        // check for the second level
        expect(data['section1']['key1']).to.be.defined;
        expect(data['section1']['key1']['subkey1']).to.equal('value1');
        expect(data['section1']['key1']['subkey2']).to.equal('value2');

        // check the third level
        expect(data['section1']['key2']).to.be.defined;
        expect(data['section1']['key2']['subkey1']['subkey1']).to.equal('value3');
        expect(data['section1']['key2']['subkey1']['subkey2']).to.equal('value4');

        expect(data['section1']['key2']['subkey2']).to.equal('value5');

        expect(data['section1']['key2']['subkey3']).to.be.defined;
        expect(data['section1']['key2']['subkey3']['subkey1']).to.equal('value6');

        // multi line parsing with second level
        expect(data['section1']['key3']).to.be.defined;
        expect(data['section1']['key3']['subkey1']).to.equal('line1\nline2');
        expect(data['section1']['key3']['subkey2']).to.equal('\nline2\nline3');
        expect(data['section1']['key3']['subkey3']).to.equal('\nline2\nline3\n');

        // multi line parsing with third level
        expect(data['section1']['key4']).to.be.defined;
        expect(data['section1']['key4']['subkey1']).to.be.defined;
        expect(data['section1']['key4']['subkey1']['subkey1']).to.equal('line1\nline2');
        expect(data['section1']['key4']['subkey1']['subkey2']).to.equal('\nline2\nline3');
        expect(data['section1']['key4']['subkey1']['subkey3']).to.equal('\nline2\nline3\n');

        expect(data['section1']['key4']['subkey2']).to.equal('value');
    });

    it("Read ini with array definitions", function () {
        var data = MultiIni.read('test/data/array.ini');

        expect(data).not.to.be.null;
        expect(data['section1']).to.be.defined;

        // array in key
        expect(data['section1']['key1']).to.be.defined;
        expect(data['section1']['key1'].length).to.equal(2);
        expect(data['section1']['key1'][0]).to.equal('value1');
        expect(data['section1']['key1'][1]).to.equal('value2');

        // normal key value
        expect(data['section1']['key2']).to.equal('value3');

        // array in subkey
        expect(data['section1']['key3']).to.be.defined;
        expect(data['section1']['key3']['subkey']).to.be.defined;
        expect(data['section1']['key3']['subkey'].length).to.equal(2);
        expect(data['section1']['key3']['subkey'][0]).to.equal('value4');
        expect(data['section1']['key3']['subkey'][1]).to.equal('value5');
    });

    it("Write ini file with one section and multiple single line values", function () {
        var data = {
            section1: {
                key1: 'value1',
                key2: 'value2'
            }
        };

        MultiIni.write('test/out/single.ini', data);

        var content = fs.readFileSync('test/out/single.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/single.ini', {encoding: 'utf8'});

        expect(content).to.equal(expectedContent);
    });

    it("Write ini file with one section and multiple multi level single line values", function () {
        var data = {
            section1: {
                key1: {
                    subkey1: 'value1',
                    subkey2: 'value2'
                },
                key2: {
                    subkey: 'value3'
                }
            }
        };

        MultiIni.write('test/out/multi_level.ini', data);

        var content = fs.readFileSync('test/out/multi_level.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/multi_level.ini', {encoding: 'utf8'});

        expect(content).to.equal(expectedContent);
    });

    it("Write a file with single and multi level and array definitions", function () {
        var data = {
            section1: {
                key1: {
                    subkey1: ['value1', 'value2'],
                    subkey2: 'value3'
                },
                key2: ['value4', 'value5']
            }
        };

        MultiIni.write('test/out/array.ini', data);

        var content = fs.readFileSync('test/out/array.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/array.ini', {encoding: 'utf8'});

        expect(content).to.equal(expectedContent);
    });

    it("Write a file with single and multi level with multi line", function () {
        var data = {
            section1: {
                key1: {
                    subkey1: 'line1\nline2',
                    subkey2: '\nline2',
                    subkey3: '\nline2\n',
                    subkey4: 'value1'
                },
                key2: 'line1\nline2',
                key3: '\nline2',
                key4: '\nline2\n',
                key5: 'value2'
            }
        };

        MultiIni.write('test/out/multi_line.ini', data);

        var content = fs.readFileSync('test/out/multi_line.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/multi_line.ini', {encoding: 'utf8'});

        expect(content).to.equal(expectedContent);
    });

    it("Write a file with single and multi level, multi line and array", function () {
        var data = {
            section1: {
                key1: {
                    subkey1: ['line1\nline2', '\nline2', '\nline2\n', 'value1'],
                    subkey2: 'value2'
                },
                key2: ['line1\nline2', '\nline2', '\nline2\n', 'value3'],
                key3: 'value4'
            }
        };

        MultiIni.write('test/out/all.ini', data);

        var content = fs.readFileSync('test/out/all.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/all.ini', {encoding: 'utf8'});

        expect(content).to.equal(expectedContent);
    });

    it("Read a basic file with a section and 2 simple keys and one multiline with keep quotes", function () {
        var data = MultiIni.read('test/data/combined_keep_quotes.ini', {keep_quotes: true});

        expect(data).not.to.be.null;

        expect(data['section1']).to.be.defined;

        expect(data['section1']['key1']).to.equal('"value1"');

        expect(data['section1']['multiline']).to.equal('"line1\nline2\nline3\n"');

        expect(data['section1']['key2']).to.equal('value2');
    });

    it("Read a basic file with a section and 2 simple keys and one multiline with keep quotes and writing it", function () {
        var data = MultiIni.read('test/data/combined_keep_quotes.ini', {keep_quotes: true});

        MultiIni.write('test/out/combined_keep_quotes.ini', data, {keep_quotes: true});

        var content = fs.readFileSync('test/out/combined_keep_quotes.ini', {encoding: 'utf8'});
        var expectedContent = fs.readFileSync('test/data/result/combined_keep_quotes.ini', {encoding: 'utf8'});

        expect(content).to.equal(expectedContent);
    });

    it("Read and writing a file with constants", function () {
        var data = MultiIni.read('test/data/constant.ini');

        expect(data).not.to.be.null;

        expect(data['section']).to.be.defined;

        expect(data['section']['key1']).to.equal('"Part1 " CONSTANT');

        expect(data['section']['key2']).to.equal('CONSTANT " Part2"');

        expect(data['section']['key3']).to.equal('Part1" CONSTANT "Part2');

        MultiIni.write('test/out/constant.ini', data);
    });

    it("Read and writing a file with constants with keeping quotes", function () {
        var data = MultiIni.read('test/data/constant.ini', {keep_quotes: true});

        expect(data).not.to.be.null;

        expect(data['section']).to.be.defined;

        expect(data['section']['key1']).to.equal('"Part1 " CONSTANT');

        expect(data['section']['key2']).to.equal('CONSTANT " Part2"');

        expect(data['section']['key3']).to.equal('"Part1" CONSTANT "Part2"');

        MultiIni.write('test/out/constant_keep.ini', data);
    });
});
