import { AnyAction as Action } from "redux";

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
      console.log("REDUCER - action is");
      console.log(action);
      const { params: navigationParams = {} } = action;
      const screenToInit = (
        state.registeredScreens[action.screen] as unknown as any
      )().default;

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
