import { spawn } from "child_process";

import locales from "../locales";

const downloadAndSaveVideo = (
  source: string,
  location: string,
  videoName: string
) =>
  new Promise((resolve, reject) => {
    if (!source) {
      return reject(locales.errors.downloadAndSave);
    }

    const ytDl = spawn("yt-dlp", [
      "-P",
      location,
      "-o",
      `${videoName}.%(ext)s`,
      source,
    ]);

    ytDl.stdout.on("data", (buf) => console.log(buf.toString("utf8")));
    ytDl.on("close", reject);
    ytDl.on("error", reject);
    ytDl.on("disconnect", reject);
    ytDl.on("exit", resolve);
  });

export default {
  downloadAndSaveVideo,
};
