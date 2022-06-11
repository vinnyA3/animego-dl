import { InvalidOptionArgumentError } from "commander";

import utils from "./general";

const { isStringEmpty } = utils;

const commanderEmptyArgValidator =
  (errorMessage: string) =>
  (value: string): typeof InvalidOptionArgumentError | string => {
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

export default {
  validateDirectoryLocation,
  validateAnimeName,
};
