#!/usr/bin/env node

const { mkdir: mkdirAsync } = require("fs/promises");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");

const cheerio = require("cheerio");
const yargs = require("yargs");

const GOGO_BASE_URL = "https://ww2.gogoanimes.org/category";
const GOGO_BASE_WATCH_URL = "https://ww2.gogoanimes.org/watch";

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

const generateEpisodeListFromRange = (range, baseUrl) => {
  const { start, end } = range;
  let episodeList = [];

  for (let i = start; i <= end; i++) {
    episodeList.push(`${baseUrl}episode-${i}`);
  }

  return episodeList;
};

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

// TODO: relocate utils
const compose2 = (f) => (g) => (x) => f(g(x));
const stripNewlinesAndSpaces = (str) => str.replace(/[\n\s]+/, "");
const stringToNum = (str) => parseInt(str);
const stripCharsAndStringToNum = compose2(stringToNum)(stripNewlinesAndSpaces);

const getEpisodeRangesFromDetailsPage = (pageHTML) => {
  const $ = cheerio.load(pageHTML);
  const episodePage = $("#episode_page");
  const episodeRanges = episodePage.find("li");
  let extractedRanges = [];

  episodeRanges.each(function () {
    const range = $(this).find("a").text();
    const bounds = range.split("-");

    extractedRanges.push(
      bounds.length === 1
        ? {
            start: 1,
            end: 1,
          }
        : {
            start: stripCharsAndStringToNum(bounds[0]),
            end: stripCharsAndStringToNum(bounds[1]),
          }
    );
  });

  return extractedRanges;
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

const normalizeInputAnimeName = (animeName) => {
  const re = /\s/i;
  return animeName.toLowerCase().replace(re, "-");
};

(async (cliArgs, GOGO_BASE_URL, GOGO_BASE_WATCH_URL) => {
  try {
    const saveLocation = cliArgs.directory;
    const normalizedAnimeName = normalizeInputAnimeName(cliArgs.animeName);
    const seriesRootUrl = `${GOGO_BASE_URL}/${normalizedAnimeName}`;
    const seriesDetailsPageHTML = await httpGet(seriesRootUrl);

    const episodeRanges = getEpisodeRangesFromDetailsPage(
      seriesDetailsPageHTML
    );

    const videoMetadata = extractVideoMetadataFromDetailsPage(
      seriesDetailsPageHTML
    );

    const { title, releaseYear } = videoMetadata;
    const seriesFolderName = `${title} (${releaseYear})`;

    // // Change working diretory to desired save location, asynchronously make
    // // series directory, and finally, change working directory to new series
    // // directory
    process.chdir(saveLocation);
    await mkdirAsync(path.join(saveLocation, seriesFolderName));
    process.chdir(path.join(saveLocation, seriesFolderName));

    for (let i = 0; i < episodeRanges.length; i++) {
      const episodeList = generateEpisodeListFromRange(
        episodeRanges[i],
        `${GOGO_BASE_WATCH_URL}/${normalizedAnimeName}-`
      );

      for (let j = 0; j < episodeList.length; j++) {
        const videoName = `episode-${j + 1}`;
        const episodeUrl = episodeList[i];
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
    }

    console.log(
      "Your anime series has been downloaded & is ready to watch, enjoy!"
    );

    process.exit(0);
  } catch (e) {
    console.error(
      `\nOo nyo :3 .. There was an error!\n\nPlease contact the developer
  and send them the following trace (if any):\n`
    );

    console.error(e);
    process.exit(1);
  }
})(cliOptions, GOGO_BASE_URL, GOGO_BASE_WATCH_URL);
