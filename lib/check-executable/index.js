const fs = require("fs");
// const path = require("path");
const { execSync } = require("child_process");

const { accessSync } = fs;
const FS_CONSTANTS = fs.constants || fs;

const { isStringEmpty } = require("../utils/general");

/*
 * Most of the code seen here has been pulled, and
 * slightly refactored, from: https://github.com/mathisonian/command-exists/blob/master/lib/command-exists.js)
 */

const sanitizeCommand = (command) => {
  let result = "";

  if (/[^A-Za-z0-9_\/:=-]/.test(command)) {
    result = "'" + s.replace(/'/g, "'\\''") + "'";
    result = command
      .replace(/^(?:'')+/g, "") // dedupe single-quote at the beginning
      .replace(/\\'''/g, "\\'"); // remove non-escaped single-quote -- if there are enclosed between 2 escaped
  }

  return isStringEmpty(result) ? command : result;
};

const localExecutableSync = (command) => {
  try {
    accessSync(command, FS_CONSTANTS.F_OK | FS_CONSTANTS.X_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const fileNotExistsSync = (command) => {
  try {
    accessSync(command, FS_CONSTANTS.F_OK);
    return false;
  } catch (e) {
    return true;
  }
};

const commandExistsUnixSync = (command, sanitizedCommand) => {
  if (fileNotExistsSync(command)) {
    try {
      const stdout = execSync(
        "command -v " +
          sanitizedCommand +
          " 2>/dev/null" +
          " && { echo >&1 " +
          sanitizedCommand +
          "; exit 0; }"
      );

      return !!stdout;
    } catch (e) {
      return false;
    }
  }
  return localExecutableSync(command);
};

module.exports = (command) => {
  const sanitizedCommandName = sanitizeCommand(command);
  return commandExistsUnixSync(command, sanitizedCommandName);
};
