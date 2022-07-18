const SET_SHOULD_DOWNLOAD = "SET_SHOULD_DOWNLOAD";
const SET_INPUT_ANIME_NAME = "SET_INPUT_ANIME_NAME";
const SET_SELECTED_TITLE = "SET_SELECTED_TITLE";

export const actionCreators = {
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
  SET_SHOULD_DOWNLOAD,
  SET_INPUT_ANIME_NAME,
  SET_SELECTED_TITLE,
};
