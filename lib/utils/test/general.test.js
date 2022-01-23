const assert = require("assert");

const {
  general: { removeMatchedPattern, stringToNum, isStringEmpty },
} = require("../index");

describe("String utility methods", () => {
  describe("stringToNum", () => {
    it("should return a 'number' type value w/ valid string number input", () => {
      assert.ok(typeof stringToNum("23" === "number"));
    });

    it("should return null when input isn't supplied or is empty", () => {
      assert.equal(stringToNum(), null);
      assert.equal(stringToNum(""), null);
    });

    it("should return null if the input isn't of type string", () => {
      assert.equal(stringToNum(2), null);
      assert.equal(stringToNum({ test: "" }), null);
      assert.equal(stringToNum(null), null);
      assert.equal(stringToNum(undefined), null);
      assert.equal(stringToNum(true), null);
      assert.equal(stringToNum(false), null);
    });

    it("should return null if the input string isn't convertible to type number", () => {
      assert.equal(stringToNum("asdfasdf"), null);
    });
  });

  describe("isStringEmpty", () => {
    it("should be truthy when supplied a type other than string", () => {
      assert.equal(isStringEmpty(2), true);
      assert.equal(isStringEmpty({ test: "" }), true);
      assert.equal(isStringEmpty(true), true);
      assert.equal(isStringEmpty(undefined), true);
      assert.equal(isStringEmpty(true), true);
      assert.equal(isStringEmpty(true), true);
    });

    it("should be falsy when input string is not empty", () => {
      assert.equal(isStringEmpty("testing"), false);
    });
  });
});
