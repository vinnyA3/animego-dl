const { mkdir: mkdirAsync } = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");

const cheerio = require("cheerio");

const {
  general: { compose2, stringToNum, removeMatchedPattern, isStringEmpty },
  http: { httpGet },
} = require("../utils");

const Constants = {
  GOGO_BASE_URL: "https://ww2.gogoanimes.org/category",
  GOGO_BASE_WATCH_URL: "https://ww2.gogoanimes.org/watch",
};

const stripNewlinesAndSpacesToNum = compose2(stringToNum)(
  removeMatchedPattern(/[\n\s]+/)
);

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
            start: stripNewlinesAndSpacesToNum(bounds[0]),
            end: stripNewlinesAndSpacesToNum(bounds[1]),
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

const is404 = (pageHTML) => {
  const $ = cheerio.load(pageHTML);
  const entryTitle = $(".entry-title");
  return entryTitle && entryTitle.text() === "404";
};

const normalizeInputAnimeName = (animeName) => {
  const re = /\s/gi;
  return animeName.toLowerCase().replace(re, "-");
};

const createEpisodeFilename = (index) =>
  `episode-${index < 10 ? "0" + index : index}`;

module.exports = async function initialize(cliOptions) {
  const saveLocation = cliOptions.directory;
  const normalizedAnimeName = normalizeInputAnimeName(cliOptions.animeName);
  const seriesRootUrl = `${Constants.GOGO_BASE_URL}/${normalizedAnimeName}`;
  const seriesDetailsPageHTML = await httpGet(seriesRootUrl);

  if (isStringEmpty(seriesDetailsPageHTML)) {
    throw new Error("Failed to scrape for title details page!");
  }

  if (is404(seriesDetailsPageHTML)) {
    throw new Error("Title not found!");
  }

  const episodeRanges = getEpisodeRangesFromDetailsPage(seriesDetailsPageHTML);

  const videoMetadata = extractVideoMetadataFromDetailsPage(
    seriesDetailsPageHTML
  );

  const { title, releaseYear } = videoMetadata;
  const seriesFolderName = `${title} (${releaseYear})`;

  // Change working directory input save location, asynchronously create
  // series directory and, finally, change working directory to
  // created directory
  process.chdir(saveLocation);
  await mkdirAsync(path.join(saveLocation, seriesFolderName));
  process.chdir(path.join(saveLocation, seriesFolderName));

  for (let i = 0; i < episodeRanges.length; i++) {
    const episodeList = generateEpisodeListFromRange(
      episodeRanges[i],
      `${Constants.GOGO_BASE_WATCH_URL}/${normalizedAnimeName}-`
    );

    for (let j = 0; j < episodeList.length; j++) {
      const videoName = createEpisodeFilename(j);
      const episodeUrl = episodeList[j];
      const episodeDetailsPageHTML = await httpGet(episodeUrl);

      const videoSourceUrl = queryEpisodeDetailsPageForVideoSrc(
        episodeDetailsPageHTML
      );

      console.info(`Now downloading: ${episodeUrl}\n`);

      if (videoSourceUrl) {
        await downloadAndSaveVideo(videoSourceUrl, videoName);
        console.info("The video has been downloaded!\n");
      }
    }
  }

  return "\nYour anime series has been downloaded & is ready to watch, enjoy!\n";
};
