const https = require("https");
const { spawn } = require("child_process");
const cheerio = require("cheerio");

const BASE_URL = "https://ww2.gogoanimes.org/watch/neon-genesis-evangelion-dub";

// TODO: once we iterate on & improve the script, we're going to:
// * read the url as a commnad line argument
// * generalize the creation of the episode list
const evangelionDubEpisodeList = ((baseUrl) => {
  const episodeCount = 27;
  let episodeList = [];

  for (let i = 1; i < episodeCount; i++) {
    episodeList.push(`${baseUrl}-episode-${i + 1}`);
  }

  return episodeList;
})(BASE_URL);

function queryEpisodePageForVideoSrc(html) {
  const $ = cheerio.load(html);
  const videoDiv = $(".play-video");
  const iFrame = videoDiv.find("iframe");

  if (iFrame && iFrame.length) {
    return iFrame.attr("src");
  }

  return null;
}

const downloadAndSaveVideo = (saveLocation, remoteVideoSrc) =>
  new Promise((resolve, reject) => {
    if (!remoteVideoSrc) {
      return reject("no video source");
    }

    try {
      process.chdir(saveLocation); // save destination directory

      const ytDl = spawn("yt-dlp", [remoteVideoSrc]);

      ytDl.stdout.on("data", (buf) => console.log(buf.toString("utf8")));
      ytDl.on("close", reject);
      ytDl.on("exit", resolve);
    } catch (e) {
      throw new Error(e);
    }
  });

const httpGet = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
};

(async () => {
  try {
    for (let i = 0; i < evangelionDubEpisodeList.length; i++) {
      const episodeUrl = evangelionDubEpisodeList[i];
      const episodePageHTML = await httpGet(episodeUrl);
      const videoSourceUrl = queryEpisodePageForVideoSrc(episodePageHTML);

      console.log("Now downloading: episodeUrl\n");

      if (videoSourceUrl) {
        await downloadAndSaveVideo("/tmp", videoSourceUrl);
        console.log("Video Downloaded!");
      }
    }

    console.log("Seried Downloaded!");
  } catch (e) {
    console.error(
      `\nOo nyo :3 .. There was an error!\n\nPlease contact the developer
  and send them the following trace (if any):\n`
    );

    console.error(e);
    process.exit(1);
  }
})();
