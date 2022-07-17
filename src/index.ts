// import * as fsP from "fs/promises";
// import path from "path";
import { createStore, combineReducers, applyMiddleware } from "redux";

import screens from "./constants/screens";

import {
  ScreenNavigator as Navigator,
  registeredScreens,
  reducers,
} from "./navigation";

import { logger } from "./middleware";
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

// initialize store
const rootReducer = combineReducers({
  ...reducers,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, applyMiddleware(logger));

// Initialize navigation manager
Navigator.initialize(store, registeredScreens);

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

// cliOptions: { download?: boolean }
const init = () => {
  Navigator.navigate(screens.Search);
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
