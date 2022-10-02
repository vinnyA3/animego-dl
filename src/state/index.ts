import { combineReducers } from "redux";

import navigationReducer from "./navigation/reducers";
import cliInputReducer from "./cli/reducers";

const rootReducer = combineReducers({
  navigation: navigationReducer,
  cliInput: cliInputReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
