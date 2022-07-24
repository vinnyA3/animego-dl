// import * as fsP from "fs/promises";
// import path from "path";
import { createStore, applyMiddleware } from "redux";

import screens from "./constants/screens";

import { ScreenNavigator as Navigator, registeredScreens } from "./navigation";

import rootReducer from "./state";
import { actionCreators } from "./state/cli/actions";
import { logger } from "./state/middleware";
// import Providers from "./providers";
// import locales from "./locales";
// import players from "./players";
// import utils from "./utils";
//
// import lib from "../lib";

// Currently, there's only one provider (gogoanime)
//   -- in the future, this will be the entry point for the cli & give the user
//   options for choosing different providers & download schemes

// const { Gogoanime } = Providers;
// const { mpv } = players;
// const { mkdir: mkdirAsync } = fsP;
// const { checkExecutableSync } = lib;
// const { errors: errorLocales } = locales;
// const {
//   download: { downloadAndSaveVideo },
// } = utils;

// Initialize store
export const store = createStore(rootReducer, applyMiddleware(logger));

// const ytDLPDownload = async (
//   location: string,
//   source: string,
//   name: string
// ) => {
//   if (checkExecutableSync("yt-dlp")) {
//     process.cwd();
//     await mkdirAsync(location, { recursive: true });
//     await downloadAndSaveVideo(source, location, name);
//     return locales.downloadSuccess(name);
//   }
//
//   return errorLocales.noYTDLP;
// };

const init = (cliOptions: { download?: boolean }) => {
  const { download: shouldDownload } = cliOptions;

  if (shouldDownload !== undefined) {
    store.dispatch(actionCreators.setShouldDownload(shouldDownload));
  }

  // Initialize Navigation
  const navigator = Navigator.initialize(store, registeredScreens);
  navigator.push && navigator.push(screens.Search);

  // const result = await Gogoanime.processing.searchAndDownloadEpisode(
  //   shouldDownload
  // );
  //
  // if (!(result?.videoSourceUrl && result?.title && result?.episodeNumber)) {
  //   return errorLocales.couldNotExtractVideo;
  // }
  //
  // const { videoSourceUrl, title, episodeNumber } = result;
  //
  // if (shouldDownload) {
  //   ytDLPDownload(
  //     path.join("./animego-dl", title),
  //     videoSourceUrl,
  //     `episode-${episodeNumber}`
  //   );
  //
  //   return;
  // }
  //
  // if (checkExecutableSync("mpv")) {
  //   mpv(videoSourceUrl);
  // } else {
  //   console.log(errorLocales.noStreamUtilFound);
  //   return videoSourceUrl;
  // }
};

export default init;
