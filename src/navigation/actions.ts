// navigation
const SET_CURRENT_SCREEN = "SET_CURRENT_SCREEN";
const SET_PREVIOUS_SCREEN = "SET_PREVIOUS_SCREEN";
const REGISTER_SCREENS = "REGISTER_SCREENS";
const PUSH_SCREEN = "PUSH_SCREEN";

// cli-input
const SET_SHOULD_DOWNLOAD = "SET_SHOULD_DOWNLOAD";
const SET_INPUT_ANIME_NAME = "SET_INPUT_ANIME_NAME";
const SET_SELECTED_TITLE = "SET_SELECTED_TITLE";

export const navigationActionCreators = {
  setCurrentScreen: (screenName: string) => ({
    type: SET_CURRENT_SCREEN,
    payload: screenName,
  }),
  setPreviousScreen: (screenName: string) => ({
    type: SET_PREVIOUS_SCREEN,
    payload: screenName,
  }),
  registerScreens: (screens: any[]) => ({
    type: REGISTER_SCREENS,
    payload: screens,
  }),
  pushScreen: (screen: string, params?: any) => ({
    type: PUSH_SCREEN,
    payload: {
      screen,
      params,
    },
  }),
};

export const cliActionCreators = {
  setInputAnimeName: (animeName: string) => ({
    type: SET_INPUT_ANIME_NAME,
    payload: animeName,
  }),
  setSelectedTitle: (title: string) => ({
    type: SET_SELECTED_TITLE,
    payload: title,
  }),
  setShouldDownload: (shouldDownload: boolean) => ({
    type: SET_SHOULD_DOWNLOAD,
    payload: shouldDownload,
  }),
};

export default {
  SET_CURRENT_SCREEN,
  SET_PREVIOUS_SCREEN,
  REGISTER_SCREENS,
  PUSH_SCREEN,
  SET_SHOULD_DOWNLOAD,
  SET_INPUT_ANIME_NAME,
  SET_SELECTED_TITLE,
};
