import { bindActionCreators, Store } from "redux";

import { actionCreators as navigationActionCreators } from "@state/navigation/actions";

export interface NavigatorParams {
  [key: string]: unknown;
}

export interface NavigatorT {
  initialize: (store: Store, screens: unknown) => this;
  store: Store | null;
  navigate: (
    screenName: string,
    params?: NavigatorParams
  ) => void | (() => void);
  push: (screenName: string, params?: NavigatorParams) => void | (() => void);
}

// WithNavigatorT - will always return the store, omit & attach to generic
export type WithNavigatorT<T = any> = T &
  Omit<NavigatorT, "initialize" | "store"> & { store: Store };

export const registeredScreens = {
  Search: () => require("./search"),
  SelectResults: () => require("./select-result"),
};

const noop = () => {
  /* noop */
};

const Navigator: NavigatorT = {
  initialize(store: Store, screens: unknown) {
    if (!(store && screens)) {
      throw new Error(
        "[ScreenNavigator] Must initialize with store & registered screen config."
      );
    }

    if (this.store) {
      return this; // protect against reinitialization
    }

    const _boundedActionCreators = bindActionCreators(
      navigationActionCreators,
      store.dispatch
    );

    _boundedActionCreators.registerScreens(screens);

    this.store = store;
    this.navigate = function navigate(screenName: string, params?: unknown) {
      if (!_boundedActionCreators) {
        throw new Error(
          "[ScreenNavigator] Called 'navigate' before 'initialize'."
        );
      }

      _boundedActionCreators.pushScreen(screenName, params);
    };

    this.push = this.navigate;

    return this;
  },
  store: null,
  navigate: noop,
  push: noop,
};

const navigatorDecorator = (navigator: NavigatorT) => {
  return function withNavigator(screen: unknown) {
    if (!screen) {
      throw new Error(
        "[withNavigator] requires an screen object type argument"
      );
    }

    const screenWithNavigator = Object.assign({}, navigator, screen);

    if (!screenWithNavigator.store) {
      throw new Error(
        "[withNavigator] store was never set. Did you initialize the Navigator?"
      );
    }

    return screenWithNavigator;
  };
};

export const withNavigator = navigatorDecorator(Navigator);

export default Navigator;
