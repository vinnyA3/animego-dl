#!/usr/bin/env node

const yargs = require("yargs");

const AnimeDL = require("../lib/anime-dl");

const cliOptions = yargs
  .usage("Usage: -d <download destination> -n <anime name>")
  .option("d", {
    alias: "directory",
    describe: "Source directory for your anime download",
    type: "string",
    demandOption: true,
  })
  .option("n", {
    alias: "anime-name",
    describe: "The title of your desired anime to download",
    type: "string",
    demandOption: true,
  }).argv;

// Initialize
AnimeDL(cliOptions)
  .then((successMessage) => {
    console.log(successMessage);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
