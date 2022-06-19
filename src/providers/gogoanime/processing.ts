import * as fsP from "fs/promises";
import path from "path";
import { prompt } from "enquirer";

import utils from "@utils/index";
import { GOGO_ROOT } from "@constants/urls";
import { BROWSER_HEADERS } from "@constants/headers";

import locales from "./locales";
import extractors from "./extractors";
import {
  selectResultPrompt,
  inputAnimePrompt,
  selectEpisodeFromRangePrompt,
  trySearchAgainPrompt,
  ResultAction,
} from "./cli";

interface GogoVideoSource {
  file: string;
  label: string;
  type: string;
}

interface GogoVideoSourceList {
  source: GogoVideoSource[];
  source_bk: GogoVideoSource[];
  track: [];
  advertising: [];
  linkiframe: string;
}

const { mkdir: mkdirAsync } = fsP;
const {
  general: { compose, safeJSONParse, isStringEmpty },
  http: { httpGet, getOriginHeadersWithLocation },
  download: { downloadAndSaveVideo },
} = utils;

const {
  extractAndDecryptSources,
  detailsEmptyOr404,
  getEntryServerUrl,
  getSearchResults,
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
} = extractors;

const getTargetVideoQualityFromSources = (
  jsonVideoSourceList: GogoVideoSourceList
): string => {
  const defaultVideoRendition = (
    jsonVideoSourceList ? [...jsonVideoSourceList.source] : []
  ).pop();

  return defaultVideoRendition?.file || "";
};

const decryptAndGetVideoSources = compose(
  extractAndDecryptSources,
  getEntryServerUrl
);

const parseSourcesAndGetVideo = compose(
  getTargetVideoQualityFromSources,
  safeJSONParse
);

const getEpisodeRangesForSeries = async (seriesDetailsPageHTML: string) =>
  detailsEmptyOr404(seriesDetailsPageHTML)
    ? []
    : getEpisodeRangesFromDetailsPage(seriesDetailsPageHTML);

const normalizeInputAnimeName = (animeName: string): string =>
  animeName.toLowerCase().replace(/\s/gi, "-");

const downloadSeries = async (cliOptions: {
  directory: string;
  animeName: string;
}) => {
  const saveLocation = cliOptions.directory;
  const normalizedAnimeName = normalizeInputAnimeName(cliOptions.animeName);
  const { location: BASE_URL } = await getOriginHeadersWithLocation(GOGO_ROOT);

  const seriesBaseUrl = locales.generateSeriesBaseUrl(
    BASE_URL,
    normalizedAnimeName
  );

  const seriesDetailsPageHTML = await httpGet(seriesBaseUrl, {
    ...BROWSER_HEADERS,
  });

  const episodeRanges = await getEpisodeRangesForSeries(seriesDetailsPageHTML);

  if (!episodeRanges || !episodeRanges.length) {
    return locales.errors.detailsPageProcessing;
  }

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

      const episodePage = await httpGet(episodeUrl, { ...BROWSER_HEADERS });
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
};

const promptSearchAgain = async () =>
  prompt([trySearchAgainPrompt]).then(
    (res: { shouldSearchAgain?: boolean }) => res.shouldSearchAgain || false
  );

const searchAndDownloadEpisode = async (download?: boolean) => {
  const { location: BASE_URL } = await getOriginHeadersWithLocation(GOGO_ROOT);
  let shouldSearchForTitle = true;

  do {
    const { inputAnimeName }: { inputAnimeName: string } = await prompt(
      inputAnimePrompt
    );

    if (isStringEmpty(inputAnimeName)) continue;

    const results = await getSearchResults(inputAnimeName);
    const searchResults = Object.keys(results) || [];

    if (searchResults.length === 0) {
      shouldSearchForTitle = await promptSearchAgain();
      continue;
    }

    const theChosenOne = await prompt(
      selectResultPrompt(
        searchResults,
        download ? ResultAction.Download : ResultAction.Stream
      )
    ).then((res: { chosenTitle?: string }) => res.chosenTitle || "");

    if (isStringEmpty(theChosenOne)) {
      shouldSearchForTitle = await promptSearchAgain();
      continue;
    }

    const episodeRanges = await httpGet(results[theChosenOne]?.url || "", {
      ...BROWSER_HEADERS,
    })
      .then(getEpisodeRangesForSeries)
      .then((ranges) => {
        ranges.forEach(({ start: curRangeStart, end: curRangeEnd }) =>
          console.log(`Episodes: [${curRangeStart} - ${curRangeEnd}]`)
        );

        return ranges;
      });

    const selectedEpisodeNumber = await prompt(
      selectEpisodeFromRangePrompt
    ).then((res: { selectedEpisode?: number }) =>
      res?.selectedEpisode ? Math.floor(res.selectedEpisode) : -1
    );

    if (
      selectedEpisodeNumber >= episodeRanges[0].start &&
      selectedEpisodeNumber <= episodeRanges[episodeRanges.length - 1].end
    ) {
      const videoSourceUrl = await httpGet(
        locales.generateEpisodeUrl(
          BASE_URL,
          normalizeInputAnimeName(theChosenOne),
          selectedEpisodeNumber
        ),
        {
          ...BROWSER_HEADERS,
        }
      )
        .then(decryptAndGetVideoSources)
        .then(parseSourcesAndGetVideo);

      return { title: theChosenOne, videoSourceUrl };
    }

    console.log("Episode not in range ...");
    shouldSearchForTitle = await promptSearchAgain();
  } while (shouldSearchForTitle);
};

export default {
  downloadSeries,
  searchAndDownloadEpisode,
};
