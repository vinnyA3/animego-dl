#!/usr/bin/env node

const { Command } = require("commander");

const AnimeDL = require("../lib/anime-dl");
const checkExecutableSync = require("../lib/check-executable");
const {
  cliInput: { validateDirectoryLocation, validateAnimeName },
} = require("../lib/utils");

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

if (checkExecutableSync("yt-dlp")) {
  const { directory } = parsedCliOptions.opts();
  const [animeName] = parsedCliOptions.args;

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
