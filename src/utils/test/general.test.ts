import assert from "assert";

import utils from "../index";

const {
  general: { stringToNum, isStringEmpty },
} = utils;

describe("String utility methods", () => {
  describe("stringToNum", () => {
    it("should return a 'number' type value w/ valid string number input", () => {
      assert.ok(typeof stringToNum("23") === "number");
    });

    it("should return null when input isn't supplied or is empty", () => {
      // @ts-ignore
      assert.equal(stringToNum(), null);
      assert.equal(stringToNum(""), null);
    });

    it("should return null if the input isn't of type string", () => {
      assert.equal(stringToNum(null), null);
      assert.equal(stringToNum(undefined), null);
    });

    it("should return null if the input string isn't convertible to type number", () => {
      assert.equal(stringToNum("asdfasdf"), null);
    });
  });

  describe("isStringEmpty", () => {
    it("should be truthy when supplied undefined as an argument", () => {
      assert.equal(isStringEmpty(undefined), true);
    });

    it("should be falsy when input string is not empty", () => {
      assert.equal(isStringEmpty("testing"), false);
    });
  });
});
