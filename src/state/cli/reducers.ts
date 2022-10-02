import { AnyAction as Action } from "redux";

import actionTypes from "./actions";

interface CLIState {
  animeName?: string | null;
  selectedTitle?: string | null;
  shouldDownload?: boolean;
}

const initialState: CLIState = {
  animeName: null,
  selectedTitle: null,
  shouldDownload: false,
};

const cliInputReducer = (state = initialState, action: Action): CLIState => {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.SET_INPUT_ANIME_NAME: {
      return {
        ...state,
        animeName: payload,
      };
    }
    case actionTypes.SET_SELECTED_TITLE: {
      return {
        ...state,
        selectedTitle: payload,
      };
    }
    case actionTypes.SET_SHOULD_DOWNLOAD: {
      return {
        ...state,
        shouldDownload: payload,
      };
    }

    default:
      return state;
  }
};

export default cliInputReducer;
