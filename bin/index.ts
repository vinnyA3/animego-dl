#!/usr/bin/env node
import { Command } from "commander";

import AnimeDL from "../lib/anime-dl";
import checkExecutableSync from "../lib/check-executable";
import utils from "../lib/utils";

const {
  cliInput: { validateDirectoryLocation, validateAnimeName },
} = utils;

const program = new Command()
  .name("animego-dl")
  .description("CLI tool to download your favorite anime series.")
  .version("3.0.0")
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
    .then((successMessage) => {
      console.log(successMessage);
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
