const assert = require("assert");

const Constants = require("../index").Constants;

const {
  generateEpisodeListFromRange,
  // queryEpisodeDetailsPageForVideoSrc,
  // extractVideoMetadataFromDetailsPage,
  // getEpisodeRangesFromDetailsPage,
  // downloadAndSaveVideo,
} = require("../processing");

const mockedEpisodeList = (numberEpisodes, animeName) => {
  let list = [];

  for (let i = 0; i < numberEpisodes; i++) {
    list.push(`${Constants.GOGO_BASE_URL}/${animeName}-episode-${i + 1}`);
  }

  return list;
};

describe("Episode processing & downloading methods", () => {
  describe("generateEpisodeListFromRange", () => {
    const normalizedAnimeTitle = "berserk-dub";
    const baseUrl = `${Constants.GOGO_BASE_URL}/${normalizedAnimeTitle}-`;
    const episodeCount = 25;
    const validRange = { start: 1, end: episodeCount };
    const mockedValidEpisodeList = mockedEpisodeList(
      episodeCount,
      normalizedAnimeTitle
    );

    it("should create list of urls from episode input range", () => {
      const episodeList = generateEpisodeListFromRange(validRange, baseUrl);
      assert.equal(episodeList.length, mockedValidEpisodeList.length);
      assert.deepEqual(episodeList, mockedValidEpisodeList);
    });

    it("each url in episode list should match structure: GOGO_BASE_URL/animename-episode-n", () => {
      const episodeRange = {
        start: 1,
        end: Math.floor(Math.random() * (30 - 2) + 2),
      };

      const episodeList = generateEpisodeListFromRange(episodeRange, baseUrl);

      episodeList.forEach((episode) => {
        assert.ok(episode.includes(baseUrl));
      });
    });
  });
});
