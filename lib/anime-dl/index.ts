import * as fsP from "fs/promises";
// eslint-disable-next-line
const path = require("path"); // ignoring import lint, path only imported as common
import cheerio from "cheerio";

import utils from "../utils";
import processingUtils from "./processing";

const { mkdir: mkdirAsync } = fsP;
const {
  general: { isStringEmpty },
  http: { httpGet, getOriginHeadersWithLocation },
} = utils;

const {
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
  downloadAndSaveVideo,
  getSourcesAndDecrypt,
  parseSourcesAndGetVideo,
} = processingUtils;

export const Constants = {
  GOGO_ROOT_ROOT: "https://gogoanime.cm",
};

const is404 = (pageHTML: string): boolean => {
  const $ = cheerio.load(pageHTML);
  const entryTitle = $(".entry-title");
  return entryTitle && entryTitle.text() === "404";
};

const normalizeInputAnimeName = (animeName: string): string => {
  const re = /\s/gi;
  return animeName.toLowerCase().replace(re, "-");
};

const createEpisodeFilename = (index: number): string =>
  `episode-${index < 10 ? "0" + index : index}`;

export default async function initialize(cliOptions: {
  directory: string;
  animeName: string;
}) {
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

  for (let i = 0; i < episodeRanges.length; i++) {
    const { start: currentRangeStart, end: currentRangeEnd } = episodeRanges[i];

    for (let j = currentRangeStart; j <= currentRangeEnd; j++) {
      const episodeUrl = `${BASE_URL}${normalizedAnimeName}-episode-${j}`;
      const episodePage = await httpGet(episodeUrl);
      const decryptedVideoSources = await getSourcesAndDecrypt(episodePage);
      const videoSourceUrl = parseSourcesAndGetVideo(decryptedVideoSources);
      const videoName = createEpisodeFilename(j);

      if (videoSourceUrl) {
        console.info(`Now downloading: ${episodeUrl}\n`);
        await downloadAndSaveVideo(videoSourceUrl, videoName);
        console.info("The video has been downloaded!\n");
      }
    }
  }

  return "\nYour anime series has been downloaded & is ready to watch, enjoy!\n";
}
