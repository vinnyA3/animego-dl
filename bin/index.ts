#!/usr/bin/env node
import { Command } from "commander";

// @ts-ignore
import lib from "../lib"; // TODO: gen type-defs

// AnimeDL
import AnimeDL from "../src";
import utils from "../src/utils";

const {
  cliInput: { validateDirectoryLocation, validateAnimeName },
} = utils;

const { checkExecutableSync } = lib;

const program = new Command()
  .name("animego-dl")
  .description("CLI tool to download your favorite anime series.")
  .version("3.1.0")
  .requiredOption(
    "-d, --directory <string>",
    "the download directory for your anime  [string] [required]",
    validateDirectoryLocation
  )
  .argument(
    "<anime name>",
    "The name of anime series to download  [string] [required]",
    validateAnimeName
  );

const parsedCliOptions = program.parse();

const { directory } = parsedCliOptions.opts();
const [animeName] = parsedCliOptions.args;

if (checkExecutableSync("yt-dlp")) {
  // initialize
  AnimeDL({ directory, animeName })
    .then((message) => {
      console.log(message);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else {
  console.log(
    "\n'yt-dlp' is not in your executable $PATH!  Please make sure you have it installed."
  );

  process.exit(1);
}
