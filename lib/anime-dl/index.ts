import * as fsP from "fs/promises";
import path from "path";
import cheerio from "cheerio";

import utils from "../utils";
import { GOGO_ROOT } from "../constants/urls";

import processingUtils from "./processing";
import locales from "./locales";

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

const has404 = (pageHTML: string): boolean => {
  const $ = cheerio.load(pageHTML);
  const entryTitle = $(".entry-title");
  return entryTitle && entryTitle.text() === "404";
};

const normalizeInputAnimeName = (animeName: string): string => {
  const re = /\s/gi;
  return animeName.toLowerCase().replace(re, "-");
};

const detailsEmptyOr404 = (pageHTML: string): boolean =>
  isStringEmpty(pageHTML) || has404(pageHTML);

export default async function initialize(cliOptions: {
  directory: string;
  animeName: string;
}) {
  const saveLocation = cliOptions.directory;
  const normalizedAnimeName = normalizeInputAnimeName(cliOptions.animeName);
  const { location: BASE_URL } = await getOriginHeadersWithLocation(GOGO_ROOT);

  const seriesBaseUrl = locales.generateSeriesBaseUrl(
    BASE_URL,
    normalizedAnimeName
  );

  const seriesDetailsPageHTML = await httpGet(seriesBaseUrl);

  if (detailsEmptyOr404(seriesDetailsPageHTML)) {
    return locales.errors.detailsPageProcessing;
  }

  const episodeRanges = getEpisodeRangesFromDetailsPage(seriesDetailsPageHTML);

  const videoMetadata = extractVideoMetadataFromDetailsPage(
    seriesDetailsPageHTML
  );

  const { title, releaseYear } = videoMetadata;
  const seriesFolderName = `${title} (${releaseYear})`;
  const seriesTargetLocation = path.join(saveLocation, seriesFolderName);

  // Asynchronously create series folder and set it to the current working directory
  await mkdirAsync(seriesTargetLocation);
  process.chdir(seriesTargetLocation);

  for (
    let currRangeIdx = 0;
    currRangeIdx < episodeRanges.length;
    currRangeIdx++
  ) {
    const { start: currentRangeStart, end: currentRangeEnd } =
      episodeRanges[currRangeIdx];

    for (
      let currentEpisodeCount = currentRangeStart;
      currentEpisodeCount <= currentRangeEnd;
      currentEpisodeCount++
    ) {
      const episodeUrl = locales.generateEpisodeUrl(
        BASE_URL,
        normalizedAnimeName,
        currentEpisodeCount
      );

      const episodePage = await httpGet(episodeUrl);
      const decryptedVideoSources = await getSourcesAndDecrypt(episodePage);
      const videoSourceUrl = parseSourcesAndGetVideo(decryptedVideoSources);
      const videoName = locales.createEpisodeFilename(currentEpisodeCount);

      if (videoSourceUrl) {
        console.info(`Now downloading: ${episodeUrl}\n`);
        await downloadAndSaveVideo(videoSourceUrl, videoName);
        console.info("The video has been downloaded!\n");
      }
    }
  }

  return locales.successfulDownload;
}
