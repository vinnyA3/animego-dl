const errors = {
  couldNotExtractVideo: "Could not extract video url!",
  downloadAndSave: "No video source was supplied!",
  noStreamUtilFound:
    "Could not find a stream utility to play your video, but try using the found source with a download tool of your choice!",
  noYTDLP:
    "\n'yt-dlp' is not in your executable $PATH!  Please make sure you have it installed.",
  mpvStartupFailure: "Failure to start mpv process.",
};

export default {
  errors,
  streamConcluded: "Hope you enjoyed your stream!",
  downloadSuccess: (title: string) => `${title} has been downloaded!`,
  loaderPrompt: "[Player Starting]",
  loaderTimeoutMessage: "Player took too long to start.  Please try again!",
};
