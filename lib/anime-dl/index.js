const { mkdir: mkdirAsync } = require("fs/promises");
const path = require("path");

const cheerio = require("cheerio");

const {
  general: { isStringEmpty, compose, safeJSONParse },
  http: { httpGet, getOriginHeadersWithLocation },
} = require("../utils");

const {
  generateEpisodeListFromRange,
  queryEpisodeDetailsPageForVideoSrc,
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
  decryptVideoSourceUrl,
  downloadAndSaveVideo,
  getTargetVideoQualityFromSources,
} = require("./processing");

const Constants = {
  GOGO_ROOT_ROOT: "https://gogoanime.cm",
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

const getVideoSrcAndDecrypt = compose(
  decryptVideoSourceUrl,
  queryEpisodeDetailsPageForVideoSrc
);

const parseSourceListAndGetVideo = compose(
  getTargetVideoQualityFromSources,
  safeJSONParse
);

module.exports = async function initialize(cliOptions) {
  const saveLocation = cliOptions.directory;
  const normalizedAnimeName = normalizeInputAnimeName(cliOptions.animeName);
  const { location: BASE_URL } = await getOriginHeadersWithLocation(
    Constants.GOGO_ROOT_ROOT
  );

  const seriesBaseUrl = `${BASE_URL}category/${normalizedAnimeName}`;
  const seriesDetailsPageHTML = await httpGet(seriesBaseUrl);

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

  for (let i = 0; i < 1; i++) {
    const episodeList = generateEpisodeListFromRange(
      episodeRanges[i],
      `${BASE_URL}${normalizedAnimeName}-`
    );

    for (let j = 0; j < 1; j++) {
      const videoName = createEpisodeFilename(j);
      const episodeUrl = episodeList[j];
      const episodeDetailsPageHTML = await httpGet(episodeUrl);
      const decryptedJSONVideoSources = await getVideoSrcAndDecrypt(
        episodeDetailsPageHTML
      );

      const videoSourceUrl = parseSourceListAndGetVideo(
        decryptedJSONVideoSources
      );

      if (videoSourceUrl) {
        console.info(`Now downloading: ${episodeUrl}\n`);
        await downloadAndSaveVideo(videoSourceUrl, videoName);
        console.info("The video has been downloaded!\n");
      }
    }
  }

  return "\nYour anime series has been downloaded & is ready to watch, enjoy!\n";
};

module.exports.Constants = Constants;
