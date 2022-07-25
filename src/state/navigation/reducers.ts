import { AnyAction as Action } from "redux";

import { Screen } from "@navigation/types";

import actionTypes from "./actions";

interface NavigationState {
  currentScreen: string | null;
  previousScreen: string | null;
  registeredScreens: Record<string, unknown>;
  stack: Screen[];
}

const initialState: NavigationState = {
  currentScreen: null,
  previousScreen: null,
  registeredScreens: {},
  stack: [],
};

const navigationReducer = (
  state = initialState,
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
      const { params: navigationParams = {} } = action;
      const { default: screenToInit } = (
        state.registeredScreens[action.screen] as () => {
          default: Screen;
        }
      )();

      return {
        ...state,
        stack: [...state.stack, screenToInit.init(navigationParams)],
      };
    }

    default:
      return state;
  }
};

export default navigationReducer;
