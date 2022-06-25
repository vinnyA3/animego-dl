import { spawn } from "child_process";

import utils from "@utils/index";
import { DEBUG } from "@utils/is-debug";
import { USER_AGENT } from "@constants/headers";
import errorCodes from "@constants/error-codes";

import locales from "../locales";

import lib from "../../lib";

const { checkExecutableSync } = lib;
const { errors: errorLocales } = locales;
const {
  loader,
  general: { once },
} = utils;

const MPV_TAG = "mpv";
const playerRunningLog = (player: string) =>
  console.log(`${player} is playing ....\n`);

const singlyLoggedPlayerRunning = once(playerRunningLog);

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

  const mpv = spawn("mpv", [`--user-agent='${USER_AGENT}'`, source], {
    stdio: DEBUG ? "pipe" : "ignore",
  });

  mpv.stdout?.on("data", (buf) => {
    processStdout += buf.toString();
    if (playerLoader?.isRunning()) processStdout += buf.toString();
    if (processStdout.length) playerLoader?.stop();

    if (DEBUG) {
      console.log(buf.toString());
    } else {
      singlyLoggedPlayerRunning(MPV_TAG);
    }
  });

  mpv.stderr?.on("data", (buf) => {
    if (playerLoader?.isRunning()) processStdout += buf.toString();
    if (playerLoader && processStdout.length) playerLoader.stop();
    DEBUG && console.error(buf.toString());
  });

  mpv.on("exit", () => console.log(`\n${locales.streamConcluded}`));
  mpv.on("error", (err) => {
    playerLoader?.stop();
    console.error(DEBUG ? err : errorCodes[201]);
  });
};
