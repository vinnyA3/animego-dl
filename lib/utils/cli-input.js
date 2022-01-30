const { InvalidOptionArgumentError } = require("commander");

const { isStringEmpty } = require("./general");

const commanderEmptyArgValidator = (errorMessage) => (value) => {
  if (isStringEmpty(value)) {
    throw new InvalidOptionArgumentError(`\n${errorMessage}`);
  }

  return value;
};

const validateDirectoryLocation = commanderEmptyArgValidator(
  "Please supply a valid directory location."
);

const validateAnimeName = commanderEmptyArgValidator(
  "Please supply an Anime name."
);

module.exports = {
  validateDirectoryLocation,
  validateAnimeName,
};
