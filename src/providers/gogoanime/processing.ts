import { prompt } from "enquirer";

import utils from "@utils/index";

import { GOGO_ROOT } from "@constants/urls";
import { BROWSER_HEADERS } from "@constants/headers";

import extractors from "./extractors";
import {
  selectResultPrompt,
  inputAnimePrompt,
  selectEpisodeFromRangePrompt,
  trySearchAgainPrompt,
  ResultAction,
} from "./cli";
import { GogoVideoSourceList } from "./types";

const {
  general: { compose, safeJSONParse, isStringEmpty },
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
    shouldSearchForTitle = await promptSearchAgain();
  } while (shouldSearchForTitle);
};

export default {
  searchAndDownloadEpisode,
};
