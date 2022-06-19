import { spawn } from "child_process";

import locales from "../locales";

const downloadAndSaveVideo = (videoSourceUrl: string, videoName: string) =>
  new Promise((resolve, reject) => {
    if (!videoSourceUrl) {
      return reject(locales.errors.downloadAndSave);
    }

    const ytDl = spawn("yt-dlp", [
      "-o",
      `${videoName}.%(ext)s`,
      videoSourceUrl,
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
