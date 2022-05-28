import { spawn } from "child_process";
import { URL } from "url";
import { createCipheriv } from "crypto";
import cheerio from "cheerio";

import utils from "../utils";
import { GOGO_ENCRYPT_AJAX } from "../constants/urls";

import locales from "./locales";

const {
  general: { compose, stringToNum, removeMatchedPattern, safeJSONParse },
  http: { httpGet },
} = utils;

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

const stripNewlinesAndSpacesToNum: (s: string) => number = compose(
  stringToNum,
  removeMatchedPattern(/[\n\s]+/)
);

const queryEpisodeDetailsPageForVideoSrc = (html: string): string | null => {
  const $ = cheerio.load(html);
  const vidCDNListItem = $(".vidcdn");
  const vidCDNLink = vidCDNListItem.find("a");
  const vidSource = vidCDNLink.attr("data-video");

  return `http:${vidSource}` || null;
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

    try {
      const ytDl = spawn("yt-dlp", [
        "-o",
        `${videoName}.%(ext)s`,
        videoSourceUrl,
      ]);

      ytDl.stdout.on("data", (buf) => console.log(buf.toString("utf8")));
      ytDl.on("close", reject);
      ytDl.on("exit", resolve);
    } catch (err) {
      throw err;
    }
  });

const decryptVideoSourceUrl = async (encryptedSourceUrl: string) => {
  try {
    const ajaxEndpoint = GOGO_ENCRYPT_AJAX;
    const secret = Buffer.from(
      "3235373436353338353932393338333936373634363632383739383333323838",
      "hex"
    ); // aes256 require secret & iv in [hex]
    const iv = Buffer.from("34323036393133333738303038313335", "hex");
    const time = "69420691337800813569";
    const matchResult = encryptedSourceUrl.match(/id=(.*)=?&token=/i);

    if (matchResult) {
      const videoId = matchResult[1];
      const cipher = createCipheriv("aes-256-cbc", secret, iv);
      let encryptedId = "";

      cipher.update(videoId, "binary");
      encryptedId += cipher.final("base64");

      return await httpGet(
        new URL(`${ajaxEndpoint}?id=${encryptedId}&time=${time}`).toString(),
        {
          headers: {
            "x-requested-with": "XMLHttpRequest",
          },
        }
      );
    }

    return null;
  } catch (err) {
    throw err;
  }
};

const getTargetVideoQualityFromSources = (
  // @ts-ignore
  jsonVideoSourceList: GogoVideoSourceList
  // TODO: get target quality as user input
  // targetQuality = "best"
): string | undefined => {
  const clonedSourceList = [...jsonVideoSourceList.source];
  const defaultVideoRendition = clonedSourceList.pop();
  // TODO: after processing user input (desired quality), add back & update
  // const bestRendition = clonedSourceList[clonedSourceList.length - 1];
  return defaultVideoRendition?.file;
};

const getSourcesAndDecrypt = compose(
  decryptVideoSourceUrl,
  queryEpisodeDetailsPageForVideoSrc // TODO: run control flow piping (ignore decryptVideoSourceUrl if empty src)
);

const parseSourcesAndGetVideo = compose(
  getTargetVideoQualityFromSources, // TODO: run control flow piping (ignore this if empty parse result)
  safeJSONParse
);

export default {
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
  downloadAndSaveVideo,
  getSourcesAndDecrypt,
  parseSourcesAndGetVideo,
};
