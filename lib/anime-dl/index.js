const { mkdir: mkdirAsync } = require("fs/promises");
const path = require("path");

const cheerio = require("cheerio");

const {
  general: { isStringEmpty },
  http: { httpGet },
} = require("../utils");

const {
  generateEpisodeListFromRange,
  queryEpisodeDetailsPageForVideoSrc,
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
  downloadAndSaveVideo,
} = require("./processing");

const Constants = {
  GOGO_BASE_URL: "https://ww2.gogoanimes.org/category",
  GOGO_BASE_WATCH_URL: "https://ww2.gogoanimes.org/watch",
};

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
  const seriesTargetLocation = path.join(saveLocation, seriesFolderName);

  // Asynchronously create series folder and set it to
  // the current working directory
  await mkdirAsync(seriesTargetLocation);
  process.chdir(seriesTargetLocation);

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

module.exports.Constants = Constants;
