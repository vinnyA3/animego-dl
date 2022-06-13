import { spawn } from "child_process";
import cheerio from "cheerio";

import utils from "@utils/index";

import locales from "./locales";
import extractors from "./extractors";

interface VideoMetadata {
  title?: string;
  releaseYear?: string;
}

interface EpisodeRange {
  start: number;
  end: number;
}

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

const {
  general: {
    compose,
    stringToNum,
    removeMatchedPattern,
    safeJSONParse,
    isStringEmpty,
  },
} = utils;

const stripNewlinesAndSpacesToNum: (s: string) => number = compose(
  stringToNum,
  removeMatchedPattern(/[\n\s]+/)
);

const detailsEmptyOr404 = (pageHTML: string): boolean => {
  if (isStringEmpty(pageHTML)) {
    return true;
  }

  const $ = cheerio.load(pageHTML);
  const entryTitle = $(".entry-title");
  return entryTitle && entryTitle.text() === "404";
};

const getEntryServerUrl = (pageHTML: string): URL | null => {
  const $ = cheerio.load(pageHTML);
  const serverUrl = $("#load_anime > div > div > iframe").attr("src");
  return serverUrl ? new URL("http:" + serverUrl) : null;
};

const extractVideoMetadataFromDetailsPage = (
  pageHTML: string
): VideoMetadata => {
  const $ = cheerio.load(pageHTML);
  const videoInfo = $(".anime_info_body");
  const videoMetadata: VideoMetadata = {};

  videoMetadata.title = videoInfo.find("h1").text();

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

const getEpisodeRangesFromDetailsPage = (pageHTML: string) => {
  const $ = cheerio.load(pageHTML);
  const episodePage = $("#episode_page");
  const episodeRanges = episodePage.find("li");
  const extractedRanges: EpisodeRange[] = [];

  episodeRanges.each(function () {
    const range = $(this).find("a").text();
    const bounds = range.split("-");
    const [start, end] = bounds.map(stripNewlinesAndSpacesToNum);

    extractedRanges.push(
      bounds.length === 1
        ? {
            start: 1,
            end: 1,
          }
        : {
            start: start === 0 ? 1 : start,
            end,
          }
    );
  });

  return extractedRanges;
};

const downloadAndSaveVideo = (videoSourceUrl: string, videoName: string) =>
  new Promise((resolve, reject) => {
    if (!videoSourceUrl) {
      return reject(locales.errors.downloadAndSave);
    }

    const ytDl = spawn("yt-dlp", [
      "-o",
      `${videoName}.%(ext)s`,
      videoSourceUrl,
    ]);

    ytDl.stdout.on("data", (buf) => console.log(buf.toString("utf8")));
    ytDl.on("close", reject);
    ytDl.on("exit", resolve);
  });

const getTargetVideoQualityFromSources = (
  jsonVideoSourceList: GogoVideoSourceList
): string | undefined => {
  const clonedSourceList = jsonVideoSourceList
    ? [...jsonVideoSourceList.source]
    : [];

  const defaultVideoRendition = clonedSourceList.pop();
  return defaultVideoRendition?.file;
};

const decryptAndGetVideoSources = compose(
  extractors.extractAndDecryptSources,
  getEntryServerUrl
);

const parseSourcesAndGetVideo = compose(
  getTargetVideoQualityFromSources,
  safeJSONParse
);

export default {
  decryptAndGetVideoSources,
  detailsEmptyOr404,
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
  getEntryServerUrl,
  downloadAndSaveVideo,
  parseSourcesAndGetVideo,
};
