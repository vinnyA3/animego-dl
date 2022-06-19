import { spawn } from "child_process";

import utils from "@utils/index";
import { USER_AGENT } from "@constants/headers";

import locales from "../locales";

import lib from "../../lib";

const { checkExecutableSync } = lib;
const { errors: errorLocales } = locales;
const { loader } = utils;

export const mpvStreamHandler = (source: string) => {
  if (!checkExecutableSync("mpv")) {
    console.log(errorLocales.noStreamUtilFound);
    return source;
  }

  let processStdout = "";

  const playerLoader = loader(
    {
      prompt: locales.loaderPrompt,
      timer: 1000,
      timeoutMessage: locales.loaderTimeoutMessage,
    },
    () => mpv.kill()
  );

  const mpv = spawn("mpv", [`--user-agent='${USER_AGENT}'`, source]);

  mpv.stdout.on("data", (buf) => {
    processStdout += buf.toString();
    if (playerLoader && processStdout.length) playerLoader.stop();
    console.log(buf.toString());
  });

  mpv.stderr.on("data", (buf) => {
    processStdout += buf.toString();
    if (playerLoader && processStdout.length) playerLoader.stop();
    console.error(buf.toString());
  });

  mpv.on("exit", () => console.log(`\n${locales.streamConcluded}`));
  mpv.on("error", () => {
    if (playerLoader) playerLoader.stop();
    console.error(errorLocales.mpvStartupFailure);
  });
};
