const compose = (f, ...rest) =>
  rest.length === 0 ? f : (x) => f(compose(...rest)(x));

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

const safeJSONParse = (str) => {
  try {
    const result = JSON.parse(str);
    return result;
  } catch (e) {
    return null;
  }
};

module.exports = {
  compose,
  removeMatchedPattern,
  stringToNum,
  isStringEmpty,
  safeJSONParse,
};
