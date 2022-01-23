const compose2 = (f) => (g) => (x) => f(g(x));

const removeMatchedPattern = (rePattern) => (str) => str.replace(rePattern, "");

const stringToNum = (str) => {
  if (!str || typeof str !== "string") {
    return null;
  }

  const parsedInt = parseInt(str);

  return isNaN(parsedInt) ? null : parsedInt;
};

const isStringEmpty = (str) => {
  return typeof str !== "string" || !str;
};

module.exports = {
  compose2,
  removeMatchedPattern,
  stringToNum,
  isStringEmpty,
};
