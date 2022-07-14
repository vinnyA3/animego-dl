import { createCipheriv, createDecipheriv } from "crypto";
import cheerio from "cheerio";

import { USER_AGENT, BROWSER_HEADERS } from "@constants/headers";
import ENV_CONFIG from "@constants/environment";
import { GOGO_ROOT, GOGO_BASE_SEARCH } from "@constants/urls";
import utils from "@utils/index";

import {
  VideoMetadata,
  EpisodeRange,
  CryptInput,
  RemoteSecrets,
  GogoSearchResults,
} from "./types";

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

const Constants = {
  algorithm: "aes-256-cbc",
};

const stripNewlinesAndSpacesToNum: (s: string) => number = compose(
  stringToNum,
  removeMatchedPattern(/[\n\s]+/)
);

const aesEncrypt = ({ source, key, iv }: CryptInput) => {
  const cipher = createCipheriv(Constants.algorithm, key, iv);
  let encryptedKey = "";

  encryptedKey += cipher.update(source, "binary");
  encryptedKey += cipher.final("base64");

  return encryptedKey;
};

const aesDecrypt = ({ source, key, iv }: CryptInput) => {
  const decipher = createDecipheriv(Constants.algorithm, key, iv);
  let decryptedToken = "";
  // @ts-ignore
  decryptedToken += decipher.update(source, "base64url", "utf-8");
  decryptedToken += decipher.final();

  return decryptedToken;
};

const extractAndDecryptSources = async (url: URL | null) => {
  if (!url) {
    return null;
  }

  // TODO: this calls for keys each time .. should save it during runtime
  const serverPageResponse = await httpGet(url.toString(), {
    ...BROWSER_HEADERS,
  });

  const embedId = url.searchParams.get("id");
  const $ = cheerio.load(serverPageResponse);
  const encryptedSource = $("script[data-name='episode']").data().value;
  const parsedSecretResult = safeJSONParse(
    await httpGet(ENV_CONFIG.urls.gogoanime.superSecret)
  );

  if (parsedSecretResult) {
    const {
      key,
      second_key: secondKey,
      iv,
    } = parsedSecretResult as unknown as RemoteSecrets;

    const encId = aesEncrypt({ source: embedId as string, key, iv });
    const decSource = aesDecrypt({
      source: encryptedSource as string,
      key,
      iv,
    });

    const gogoAjax = `${url.protocol}//${url.hostname}/encrypt-ajax.php?id=${encId}&alias=${embedId}&token=${decSource}`;

    const parsedEncryptedSources =
      safeJSONParse(
        await httpGet(gogoAjax, {
          headers: {
            "User-Agent": USER_AGENT,
            "X-Requested-With": "XMLHttpRequest",
          },
        })
      )?.data || {};

    return aesDecrypt({
      source: parsedEncryptedSources as string,
      key: secondKey,
      iv,
    });
  }
};

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

const getSearchResults = async (userAnimeQuery: string, pageNumber = 1) => {
  const targetPageHTML = await httpGet(
    `${GOGO_BASE_SEARCH}?keyword=${userAnimeQuery}&page=${pageNumber}`,
    {
      ...BROWSER_HEADERS,
    }
  );

  const $ = cheerio.load(targetPageHTML);
  const results: GogoSearchResults = {};

  $("div.last_episodes > ul > li").each((_, el) => {
    const $element = $(el).find("p.name > a");
    const $elementLink = $element.attr("href");

    if ($element && $elementLink) {
      const id = $elementLink?.split("/")[2];

      results[id] = {
        id,
        title: $element.attr("title") || null,
        url: $elementLink ? `${GOGO_ROOT}/${$elementLink}` : null,
      };
    }
  });

  return results;
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

export default {
  extractAndDecryptSources,
  detailsEmptyOr404,
  getEntryServerUrl,
  getSearchResults,
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
};
