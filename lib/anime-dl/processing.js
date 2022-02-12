const { spawn } = require("child_process");
const { URL } = require("url");
const crypto = require("crypto");

const cheerio = require("cheerio");

const {
  general: { compose, stringToNum, removeMatchedPattern, safeJSONParse },
  http: { httpGet },
} = require("../utils");

const stripNewlinesAndSpacesToNum = compose(
  stringToNum,
  removeMatchedPattern(/[\n\s]+/)
);

const queryEpisodeDetailsPageForVideoSrc = (html) => {
  const $ = cheerio.load(html);
  const vidCDNListItem = $(".vidcdn");
  const vidCDNLink = vidCDNListItem.find("a");
  const vidSource = vidCDNLink.attr("data-video");

  return `http:${vidSource}` || null;
};

const extractVideoMetadataFromDetailsPage = (pageHTML) => {
  const $ = cheerio.load(pageHTML);
  const videoInfo = $(".anime_info_body");
  let videoMetadata = {};

  videoMetadata.title = videoInfo.find("h1").text() || null;

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

const getEpisodeRangesFromDetailsPage = (pageHTML) => {
  const $ = cheerio.load(pageHTML);
  const episodePage = $("#episode_page");
  const episodeRanges = episodePage.find("li");
  let extractedRanges = [];

  episodeRanges.each(function () {
    const range = $(this).find("a").text();
    const bounds = range.split("-");
    const [lowerBound, upperBound] = bounds;
    const normalizedLowerBound = stripNewlinesAndSpacesToNum(lowerBound);
    const normalizedUpperBound = stripNewlinesAndSpacesToNum(upperBound);

    extractedRanges.push(
      bounds.length === 1
        ? {
            start: 1,
            end: 1,
          }
        : {
            start: normalizedLowerBound === 0 ? 1 : normalizedLowerBound,
            end: normalizedUpperBound,
          }
    );
  });

  return extractedRanges;
};

const downloadAndSaveVideo = (videoSourceUrl, videoName) =>
  new Promise((resolve, reject) => {
    if (!videoSourceUrl) {
      return reject("Something went wrong: no video source was supplied!");
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
    } catch (e) {
      throw new Error(e);
    }
  });

const decryptVideoSourceUrl = async (encryptedSourceUrl) => {
  try {
    if (!encryptedSourceUrl) {
      throw new Error("Failed to retrieve video url from series details page!");
    }

    const ajaxEndpoint = "https://gogoplay.io/encrypt-ajax.php";
    const secret = Buffer.from(
      "3235373436353338353932393338333936373634363632383739383333323838",
      "hex"
    ); // aes256 require secret & iv in [hex]
    const iv = Buffer.from("34323036393133333738303038313335", "hex");
    const time = "69420691337800813569";
    const videoId = encryptedSourceUrl.match(/id=(.*)=?&token=/i)[1];
    const cipher = crypto.createCipheriv("aes-256-cbc", secret, iv);
    let encryptedId = cipher.update(videoId, "binary");

    encryptedId += cipher.final("base64");

    const result = await httpGet(
      new URL(`${ajaxEndpoint}?id=${encryptedId}&time=${time}`).toString(),
      {
        headers: {
          "x-requested-with": "XMLHttpRequest",
        },
      }
    );

    return result;
  } catch (error) {
    throw Error("Oops! Something went wrong.", { cause: error });
  }
};

const getTargetVideoQualityFromSources = (
  jsonVideoSourceList
  // TODO: get target quality as user input
  // targetQuality = "best"
) => {
  const clonedSourceList = [...jsonVideoSourceList.source];
  const defaultVideoRendition = clonedSourceList.pop();
  // TODO: after processing user input (desired quality), add back & update
  // const bestRendition = clonedSourceList[clonedSourceList.length - 1];
  return defaultVideoRendition.file;
};

const getSourcesAndDecrypt = compose(
  decryptVideoSourceUrl,
  queryEpisodeDetailsPageForVideoSrc
);

const parseSourcesAndGetVideo = compose(
  getTargetVideoQualityFromSources,
  safeJSONParse
);

module.exports = {
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
  downloadAndSaveVideo,
  getSourcesAndDecrypt,
  parseSourcesAndGetVideo,
};
