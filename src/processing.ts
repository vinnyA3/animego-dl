import { spawn } from "child_process";
import { createCipheriv, createDecipheriv } from "crypto";
import cheerio from "cheerio";

import utils from "./utils";
import { KK_SLIDER } from "./constants/urls";
import { USER_AGENT } from "./constants/headers";
import locales from "./locales";

const {
  general: {
    compose,
    stringToNum,
    removeMatchedPattern,
    safeJSONParse,
    isStringEmpty,
  },
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

// TODO: refactor this monstrosity!!
const decryptVideoSourceUrl = async (entryUrl: URL | null) => {
  if (!entryUrl) {
    return null;
  }

  const serverPageResponse = await httpGet(entryUrl.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  const embedId = entryUrl.searchParams.get("id");
  const $ = cheerio.load(serverPageResponse);
  const script = $("script[data-name='episode']").data().value;
  const secrets = await httpGet(KK_SLIDER);
  const parsedSecrets = JSON.parse(secrets);
  const { iv, key, second_key: secondKey } = parsedSecrets;
  const alg = "aes-256-cbc";

  const cipher = createCipheriv(alg, key, iv); // encrypt ajax param id
  const decipher = createDecipheriv(alg, key, iv); // decrypt token
  const decipher2 = createDecipheriv(alg, secondKey, iv); // decrypt ajax return encrypted video source url

  let token = "";
  // @ts-ignore
  token += decipher.update(script, "base64url", "utf-8");
  token += decipher.final();

  let encryptedKey = "";
  // @ts-ignore
  encryptedKey += cipher.update(embedId, "binary");
  encryptedKey += cipher.final("base64");

  const params = `id=${encryptedKey}&alias=${embedId}&token=${token}`;
  const encAjaxEndpoint = `${entryUrl.protocol}//${entryUrl.hostname}/encrypt-ajax.php?${params}`;

  const payload = await httpGet(encAjaxEndpoint, {
    headers: {
      "User-Agent": USER_AGENT,
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const encryptedSourceString = JSON.parse(payload);

  let decryptedSources = "";

  decryptedSources += decipher2.update(
    encryptedSourceString.data,
    "base64url",
    "utf-8"
  );

  decryptedSources += decipher2.final();

  return decryptedSources;
};

const getTargetVideoQualityFromSources = (
  jsonVideoSourceList: GogoVideoSourceList
): string | undefined => {
  const clonedSourceList = [...jsonVideoSourceList.source];
  const defaultVideoRendition = clonedSourceList.pop();
  return defaultVideoRendition?.file;
};

const decryptAndGetVideoSources = compose(
  decryptVideoSourceUrl,
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
