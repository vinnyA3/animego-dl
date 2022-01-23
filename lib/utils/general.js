const compose2 = (f) => (g) => (x) => f(g(x));

const removeMatchedPattern = (rePattern) => (str) => str.replace(rePattern, "");

const stringToNum = (str) => parseInt(str);

const isStringEmpty = (str) => {
  return typeof str !== "string" || !str;
};

module.exports = {
  compose2,
  removeMatchedPattern,
  stringToNum,
  isStringEmpty,
};
