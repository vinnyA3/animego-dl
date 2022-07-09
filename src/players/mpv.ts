import { spawn } from "child_process";

import { DEBUG } from "@utils/is-debug";
import { USER_AGENT } from "@constants/headers";
import errorCodes from "@constants/error-codes";

import locales from "../locales";

import lib from "../../lib";

const { checkExecutableSync } = lib;
const { errors: errorLocales } = locales;

const log = (buf?: string) =>
  process.stdout.write(
    DEBUG && buf ? `\r${buf?.toString()}` : "\rPlayer Running ..."
  );

export const mpvStreamHandler = (source: string) => {
  if (!checkExecutableSync("mpv")) {
    console.log(errorLocales.noStreamUtilFound);
    return source;
  }

  const mpv = spawn("mpv", [`--user-agent='${USER_AGENT}'`, source], {
    stdio: "pipe",
  });

  mpv.stdout?.on("data", log);
  mpv.stderr?.on("data", log);
  mpv.on("exit", () => console.log(`\n${locales.streamConcluded}`));
  mpv.on("error", (err) => console.error(DEBUG ? err : errorCodes[201]));
};
