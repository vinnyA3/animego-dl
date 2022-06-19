#!/usr/bin/env node
import { Command } from "commander";

// AnimeDL
import AnimeDL from "../src";
import pkgJSON from "../package.json";

const { name: pkgName, version: pkgVersion } = pkgJSON;
const versionOutput = `${pkgName} v${pkgVersion}`;

const program = new Command()
  .name("animego-dl")
  .description("CLI tool to download your favorite anime series.")
  .version(`${versionOutput}`, "-v, --version", "output the current version")
  .option("-d, --download", "choose to download your desired anime");

const cliOptions = program.opts();
program.parse();

AnimeDL(cliOptions)
  .then((data) => {
    data && console.log(data);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
