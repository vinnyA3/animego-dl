import { makeActionCreator } from "@utils/state";

const SET_SHOULD_DOWNLOAD = "SET_SHOULD_DOWNLOAD";
const SET_INPUT_ANIME_NAME = "SET_INPUT_ANIME_NAME";
const SET_SELECTED_TITLE = "SET_SELECTED_TITLE";

const setInputAnimeName = makeActionCreator(SET_INPUT_ANIME_NAME, "payload");
const setSelectedTitle = makeActionCreator(SET_SELECTED_TITLE, "payload");
const setShouldDownload = makeActionCreator(SET_SHOULD_DOWNLOAD, "payload");

export const actionCreators = {
  setInputAnimeName,
  setSelectedTitle,
  setShouldDownload,
};

export default {
  SET_SHOULD_DOWNLOAD,
  SET_INPUT_ANIME_NAME,
  SET_SELECTED_TITLE,
};
