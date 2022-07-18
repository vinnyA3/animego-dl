import { makeActionCreator } from "@utils/state";

const SET_CURRENT_SCREEN = "SET_CURRENT_SCREEN";
const SET_PREVIOUS_SCREEN = "SET_PREVIOUS_SCREEN";
const REGISTER_SCREENS = "REGISTER_SCREENS";
const PUSH_SCREEN = "PUSH_SCREEN";

const setCurrentScreen = makeActionCreator(SET_CURRENT_SCREEN, "payload");
const setPreviousScreen = makeActionCreator(SET_PREVIOUS_SCREEN, "payload");
const registerScreens = makeActionCreator(REGISTER_SCREENS, "payload");
const pushScreen = makeActionCreator(PUSH_SCREEN, "screen", "params");

export const actionCreators = {
  setCurrentScreen,
  setPreviousScreen,
  registerScreens,
  pushScreen,
};

export default {
  SET_CURRENT_SCREEN,
  SET_PREVIOUS_SCREEN,
  REGISTER_SCREENS,
  PUSH_SCREEN,
};
