const errors = {
  detailsPageProcessing:
    "Oops! Failed to scrape for the title's details page.  Either the title wasn't found, or something went wrong during initial metadata processing.  Please check your input title's name for errors.",
};

export default {
  errors,
  createEpisodeFilename: (episodeCount: number) =>
    `episode-${episodeCount < 10 ? "0" + episodeCount : episodeCount}`,
  generateSeriesBaseUrl: (baseUrl: string, normalizedTitle: string) =>
    `${baseUrl}category/${normalizedTitle}`,
  generateEpisodeUrl: (
    baseUrl: string,
    normalizedTitle: string,
    episodeCount: number
  ) => `${baseUrl}${normalizedTitle}-episode-${episodeCount}`,
  successfulDownload: "\nYour title has been downloaded!  Enjoy!",
};
