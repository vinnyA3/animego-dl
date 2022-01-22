#!/usr/bin/env node

const { mkdir: mkdirAsync } = require("fs/promises");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");
const cheerio = require("cheerio");

const SERIES_ROOT_URL =
  "https://ww2.gogoanimes.org/category/neon-genesis-evangelion-dub";
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

// TODO: figure out how to get the episode list + count
// problem - the series details page (on animegogo) dynamically added the list with an external
// script, can we wait for this script to run & cheerio-scrape the generated html?
//
// const getSeriesEpisodeList = () => {}

const queryEpisodeDetailsPageForVideoSrc = (html) => {
  const $ = cheerio.load(html);
  const videoDiv = $(".play-video");
  const iFrame = videoDiv.find("iframe");

  if (iFrame && iFrame.length) {
    return iFrame.attr("src");
  }

  return null;
};

const extractVideoMetadataFromDetailsPage = (pageHTML) => {
  const $ = cheerio.load(pageHTML);
  const videoInfo = $(".anime_info_body");
  let videoMetadata = {};

  videoMetadata.title = videoInfo.find("h1").text() || null;

  videoInfo.find("p").each(function () {
    const type = $(this).find("span").text().toLowerCase();

    if (type.includes("released")) {
      const releaseYearProperty = $(this).text();
      const releaseYear = releaseYearProperty.split(": ")[1];
      videoMetadata.releaseYear = releaseYear;

      return false;
    }
  });

  return videoMetadata;
};

const downloadAndSaveVideo = (videoSourceUrl, videoName) =>
  new Promise((resolve, reject) => {
    if (!videoSourceUrl) {
      return reject("Something went wrong: no video source was supplied!");
    }

    try {
      const ytDl = spawn("yt-dlp", [
        "-o",
        `${videoName}.%(ext)s`,
        videoSourceUrl,
      ]);

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
    const saveLocation = "/tmp";
    const seriesDetailsPageHTML = await httpGet(SERIES_ROOT_URL);

    const videoMetadata = extractVideoMetadataFromDetailsPage(
      seriesDetailsPageHTML
    );

    const { title, releaseYear } = videoMetadata;
    const seriesFolderName = `${title} (${releaseYear})`;

    // Change working diretory to desired save location, asynchronously make
    // series directory, and finally, change working directory to new series
    // directory
    process.chdir(saveLocation);
    await mkdirAsync(path.join(saveLocation, seriesFolderName));
    process.chdir(path.join(saveLocation, seriesFolderName));

    for (let i = 0; i < 1; i++) {
      const videoName = `episode-${i}`;
      const episodeUrl = evangelionDubEpisodeList[i];
      const episodeDetailsPageHTML = await httpGet(episodeUrl);

      const videoSourceUrl = queryEpisodeDetailsPageForVideoSrc(
        episodeDetailsPageHTML
      );

      console.log(`Now downloading: ${episodeUrl}\n`);

      if (videoSourceUrl) {
        await downloadAndSaveVideo(videoSourceUrl, videoName);
        console.log("The video has been downloaded!");
      }
    }
  } catch (e) {
    console.error(
      `\nOo nyo :3 .. There was an error!\n\nPlease contact the developer
  and send them the following trace (if any):\n`
    );

    console.error(e);
    process.exit(1);
  }
})();
