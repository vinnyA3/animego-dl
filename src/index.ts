import * as fsP from "fs/promises";
import path from "path";

import utils from "./utils";
import locales from "./locales";
import { GOGO_ROOT } from "./constants/urls";

import processingUtils from "./processing";

const { mkdir: mkdirAsync } = fsP;
const {
  http: { httpGet, getOriginHeadersWithLocation },
} = utils;

const {
  decryptAndGetVideoSources,
  detailsEmptyOr404,
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
  downloadAndSaveVideo,
  parseSourcesAndGetVideo,
} = processingUtils;

const normalizeInputAnimeName = (animeName: string): string => {
  const re = /\s/gi;
  return animeName.toLowerCase().replace(re, "-");
};

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
      const decryptedVideoSources = await decryptAndGetVideoSources(
        episodePage
      );

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
