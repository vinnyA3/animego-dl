import { AnyAction as Action } from "redux";

import actionTypes from "./actions";

interface Screen {
  render: () => void;
}

interface NavigationState {
  currentScreen: string | null;
  previousScreen: string | null;
  registeredScreens: Record<string, unknown>;
  stack: Screen[];
}

interface CLIState {
  animeName?: string | null;
  selectedTitle?: string | null;
  shouldDownload?: boolean;
}

const initialNavigationState: NavigationState = {
  currentScreen: null,
  previousScreen: null,
  registeredScreens: {},
  stack: [],
};

const initialCLIInputState: CLIState = {
  animeName: null,
  selectedTitle: null,
  shouldDownload: false,
};

const navigationReducer = (
  state = initialNavigationState,
  action: Action
): NavigationState => {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.REGISTER_SCREENS: {
      return {
        ...state,
        registeredScreens: { ...state.registeredScreens, ...payload },
      };
    }
    case actionTypes.PUSH_SCREEN: {
      const { params, screen } = payload;
      const screenToInit = state.registeredScreens[screen];
      // @ts-ignore
      const initializedScreen = new screenToInit(params);

      return {
        ...state,
        stack: [...state.stack, initializedScreen],
      };
    }

    default:
      return state;
  }
};

const cliInputReducer = (
  state = initialCLIInputState,
  action: Action
): CLIState => {
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

export default {
  navigation: navigationReducer,
  cliInput: cliInputReducer,
};
