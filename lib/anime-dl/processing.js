const { spawn } = require("child_process");

const cheerio = require("cheerio");

const {
  general: { compose2, stringToNum, removeMatchedPattern },
} = require("../utils");

const stripNewlinesAndSpacesToNum = compose2(stringToNum)(
  removeMatchedPattern(/[\n\s]+/)
);

const generateEpisodeListFromRange = (range, baseUrl) => {
  const { start, end } = range;
  let episodeList = [];

  for (let i = start; i <= end; i++) {
    episodeList.push(`${baseUrl}episode-${i}`);
  }

  return episodeList;
};

const queryEpisodeDetailsPageForVideoSrc = (html) => {
  const $ = cheerio.load(html);
  const videoDiv = $(".play-video");
  const iFrame = videoDiv.find("iframe");

  if (iFrame && iFrame.length) {
    return iFrame.attr("src");
  }

  return null;
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

    extractedRanges.push(
      bounds.length === 1
        ? {
            start: 1,
            end: 1,
          }
        : {
            start: stripNewlinesAndSpacesToNum(bounds[0]),
            end: stripNewlinesAndSpacesToNum(bounds[1]),
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

module.exports = {
  generateEpisodeListFromRange,
  queryEpisodeDetailsPageForVideoSrc,
  extractVideoMetadataFromDetailsPage,
  getEpisodeRangesFromDetailsPage,
  downloadAndSaveVideo,
};
