import { prompt } from "enquirer";

import utils from "@utils/index";

import { GOGO_ROOT } from "@constants/urls";
import { BROWSER_HEADERS } from "@constants/headers";

import extractors from "./extractors";
import {
  selectResultPrompt,
  // inputAnimePrompt,
  selectEpisodeFromRangePrompt,
  // trySearchAgainPrompt,
  ResultAction,
} from "./cli";
import { GogoVideoSourceList } from "./types";

const {
  general: { compose, safeJSONParse },
  http: { httpGet, getOriginHeadersWithLocation },
} = utils;

const {
  extractAndDecryptSources,
  detailsEmptyOr404,
  getEntryServerUrl,
  getSearchResults,
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

const searchAnime = async (inputAnimeName: string) => {
  const results = await getSearchResults(inputAnimeName);
  const searchResults = Object.keys(results) || [];
  return searchResults;
};

const searchAndDownloadEpisode = async (
  inputAnimeName: string,
  shouldDownload = false
) => {
  const { location: BASE_URL } = await getOriginHeadersWithLocation(GOGO_ROOT);
  const results = await getSearchResults(inputAnimeName);
  const searchResults = Object.keys(results) || [];

  const theChosenOne = await prompt(
    selectResultPrompt(
      searchResults,
      shouldDownload ? ResultAction.Download : ResultAction.Stream
    )
  ).then((res: { chosenTitle?: string }) => res.chosenTitle || "");

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

  const selectedEpisodeNumber = await prompt(selectEpisodeFromRangePrompt).then(
    (res: { selectedEpisode?: number }) =>
      res?.selectedEpisode ? Math.floor(res.selectedEpisode) : -1
  );

  if (
    selectedEpisodeNumber >= episodeRanges[0].start &&
    selectedEpisodeNumber <= episodeRanges[episodeRanges.length - 1].end
  ) {
    const videoSourceUrl = await httpGet(
      `${BASE_URL}${normalizeInputAnimeName(
        theChosenOne
      )}-episode-${selectedEpisodeNumber}`,
      {
        ...BROWSER_HEADERS,
      }
    )
      .then(decryptAndGetVideoSources)
      .then(parseSourcesAndGetVideo);

    return {
      title: theChosenOne,
      episodeNumber: selectedEpisodeNumber,
      videoSourceUrl,
    };
  }

  console.log("Episode not in range ...");
};

export default {
  searchAndDownloadEpisode,
  searchAnime,
};
