import { bindActionCreators, Store } from "redux";

import { actionCreators as navigationActionCreators } from "@state/navigation/actions";

export interface NavigatorParams {
  [key: string]: unknown;
}

export interface NavigatorT {
  initialize: (store: Store, screens: any) => this;
  store?: Store;
  navigate?: (screenName: string, params?: NavigatorParams) => void;
  push?: (screenName: string, params?: NavigatorParams) => void;
}

export const registeredScreens = {
  Search: () => require("./search"),
  SelectResults: () => require("./select-result"),
};

const Navigator: NavigatorT = {
  initialize(store: Store, screens: any) {
    if (!(store && screens)) {
      throw new Error(
        "[ScreenNavigator] Must initialize with store & registered screen config."
      );
    }

    const _boundedActionCreators = bindActionCreators(
      navigationActionCreators,
      store.dispatch
    );

    _boundedActionCreators.registerScreens(screens);

    this.store = store;
    this.navigate = function navigate(screenName: string, params?: any) {
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
};

//@ts-ignore
const navigatorDecorator = (navigator: NavigatorT) => {
  return function withNavigator(extendible: any) {
    if (!extendible) {
      throw new Error("[withNavigator] requires an object type argument");
    }

    return Object.assign({}, navigator, extendible);
  };
};

export const withNavigator = navigatorDecorator(Navigator);

export default Navigator;
