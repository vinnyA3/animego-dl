import { bindActionCreators } from "../redux";

import { actionCreators as navigationActionCreators } from "./redux/actions";

// screens to register
import Search from "./screens/search";
import SelectResults from "./screens/select-result";

export interface NavigatorT {
  navigate: (screenName: string, params?: any) => void;
  push: (screenName: string, params?: any) => void;
}

export const registeredScreens = {
  Search,
  SelectResults,
};

class ScreenNavigator {
  private boundedActionCreators: any;

  initialize(store: any, screens: any) {
    if (!(store && screens)) {
      throw new Error(
        "[ScreenNavigator] Must initialize with store & registered screen config."
      );
    }

    if (this.boundedActionCreators) {
      return this; // already initialized
    }

    const boundedActionCreators = bindActionCreators(
      navigationActionCreators,
      store.dispatch
    );

    // @ts-ignore
    boundedActionCreators.registerScreens(screens);
    this.boundedActionCreators = boundedActionCreators;

    return this;
  }

  navigate(screenName: string, params?: any) {
    if (!this?.boundedActionCreators) {
      throw new Error(
        "[ScreenNavigator] Called 'navigate' before 'initialize'."
      );
    }

    this.boundedActionCreators.pushScreen(screenName, params);
  }

  push(screenName: string, params?: any) {
    if (!this?.boundedActionCreators) {
      throw new Error("[ScreenNavigator] Called 'push' before 'initialize'.");
    }

    this.navigate(screenName, params); // -- alias to navigate
  }
}

export default new ScreenNavigator();
