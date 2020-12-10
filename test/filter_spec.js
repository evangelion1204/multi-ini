"use strict";

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;

chai.use(sinonChai);

describe("Filters", function () {
  var MultiIni = require("../src");

  it("Availability of the filters", function () {
    expect(MultiIni.filters).not.to.be.undefined;
    expect(MultiIni.filters).not.to.be.null;
  });

  describe("lowercase", function () {
    it("is available", function () {
      expect(MultiIni.filters.lowercase).to.be.defined;
    });

    it("string should be lowercase", function () {
      expect(MultiIni.filters.lowercase("Test")).to.equal("test");
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
      expect(MultiIni.filters.uppercase("Test")).to.equal("TEST");
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
      expect(MultiIni.filters.trim(" Test ")).to.equal("Test");
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
      const options = { constants: { CONSTANT: "replaced" } };

      expect(MultiIni.filters.constants('"Test " CONSTANT', options)).to.equal(
        '"Test replaced"'
      );
      expect(
        MultiIni.filters.constants('"Test " CONSTANT " Test"', options)
      ).to.equal('"Test replaced Test"');
      expect(MultiIni.filters.constants('CONSTANT " Test"', options)).to.equal(
        '"replaced Test"'
      );
    });

    it("anything else then string will be returned unmodified", function () {
      expect(MultiIni.filters.constants(false)).to.equal(false);
    });
  });

  describe("boolean", function () {
    it("is available", function () {
      expect(MultiIni.filters.boolean).to.be.defined;
    });

    it("string should have replaced booleans", function () {
      // true
      expect(MultiIni.filters.boolean("on")).to.equal(true);
      expect(MultiIni.filters.boolean("On")).to.equal(true);
      expect(MultiIni.filters.boolean("yes")).to.equal(true);
      expect(MultiIni.filters.boolean("Yes")).to.equal(true);
      expect(MultiIni.filters.boolean("true")).to.equal(true);
      expect(MultiIni.filters.boolean("True")).to.equal(true);
      expect(MultiIni.filters.boolean("TRUE")).to.equal(true);
      // false
      expect(MultiIni.filters.boolean("off")).to.equal(false);
      expect(MultiIni.filters.boolean("Off")).to.equal(false);
      expect(MultiIni.filters.boolean("no")).to.equal(false);
      expect(MultiIni.filters.boolean("No")).to.equal(false);
      expect(MultiIni.filters.boolean("false")).to.equal(false);
      expect(MultiIni.filters.boolean("False")).to.equal(false);
      expect(MultiIni.filters.boolean("FALSE")).to.equal(false);
      expect(MultiIni.filters.boolean("none")).to.equal(false);
    });

    it("anything else then string will be returned unmodified", function () {
      expect(MultiIni.filters.boolean("test")).to.equal("test");
      expect(MultiIni.filters.boolean(3)).to.equal(3);
    });
  });
});
