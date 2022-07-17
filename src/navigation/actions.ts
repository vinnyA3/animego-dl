const SET_CURRENT_SCREEN = "SET_CURRENT_SCREEN";
const SET_PREVIOUS_SCREEN = "SET_PREVIOUS_SCREEN";
const REGISTER_SCREENS = "REGISTER_SCREENS";
const PUSH_SCREEN = "PUSH_SCREEN";

export const actionCreators = {
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

export default {
  SET_CURRENT_SCREEN,
  SET_PREVIOUS_SCREEN,
  REGISTER_SCREENS,
  PUSH_SCREEN,
};
