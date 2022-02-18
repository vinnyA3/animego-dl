import * as fs from "fs";

import { execSync } from "child_process";

import utils from "../utils";

const { accessSync } = fs;
const FS_CONSTANTS = fs.constants || fs;
const {
  general: { isStringEmpty },
} = utils;

/*
 * Most of the code seen here has been pulled, and
 * slightly refactored, from: https://github.com/mathisonian/command-exists/blob/master/lib/command-exists.js)
 */

const sanitizeCommand = (command: string): string => {
  let result = "";

  if (/[^A-Za-z0-9_/:=-]/.test(command)) {
    result = "'" + command.replace(/'/g, "'\\''") + "'";
    result = command
      .replace(/^(?:'')+/g, "") // dedupe single-quote at the beginning
      .replace(/\\'''/g, "\\'"); // remove non-escaped single-quote -- if there are enclosed between 2 escaped
  }

  return isStringEmpty(result) ? command : result;
};

const localExecutableSync = (command: string): boolean => {
  try {
    accessSync(command, FS_CONSTANTS.F_OK | FS_CONSTANTS.X_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const fileNotExistsSync = (command: string): boolean => {
  try {
    accessSync(command, FS_CONSTANTS.F_OK);
    return false;
  } catch (e) {
    return true;
  }
};

const commandExistsUnixSync = (
  command: string,
  sanitizedCommand: string
): boolean => {
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

export default (command: string): boolean => {
  const sanitizedCommandName = sanitizeCommand(command);
  return commandExistsUnixSync(command, sanitizedCommandName);
};
