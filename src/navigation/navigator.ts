import { bindActionCreators, Store } from "redux";

import { actionCreators as navigationActionCreators } from "@state/navigation/actions";

// Screens to be registered
import Search from "./search";
import SelectResults from "./select-result";

export interface NavigatorParams {
  [key: string]: unknown;
}

export interface NavigatorT {
  navigate: (screenName: string, params?: NavigatorParams) => void;
  push: (screenName: string, params?: NavigatorParams) => void;
}

export const registeredScreens = {
  Search,
  SelectResults,
};

/*
 * Navigator - A singleton import which provides a hook into the basic,
 * redux navigation api. This will be refactored into an extendable interface
 */
class Navigator {
  private boundedActionCreators: any;

  initialize(store: Store, screens: any) {
    if (!(store && screens)) {
      throw new Error(
        "[ScreenNavigator] Must initialize with store & registered screen config."
      );
    }

    if (this.boundedActionCreators) {
      return this; // already initialized, return instance
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

  navigate(screenName: string, params?: NavigatorParams) {
    if (!this?.boundedActionCreators) {
      throw new Error(
        "[ScreenNavigator] Called 'navigate' before 'initialize'."
      );
    }

    this.boundedActionCreators.pushScreen(screenName, params);
  }

  push(screenName: string, params?: NavigatorParams) {
    if (!this?.boundedActionCreators) {
      throw new Error("[ScreenNavigator] Called 'push' before 'initialize'.");
    }

    this.navigate(screenName, params); // -- alias to navigate
  }
}

export default new Navigator();
