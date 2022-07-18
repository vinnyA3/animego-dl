import { Store } from "redux";

import { store as globalStore } from "src/index";

/*
 * ScreenNavigator - Currently extended by all screens requiring a store reference
 */
export default class ScreenNavigator {
  store: Store;

  constructor() {
    this.store = globalStore;
  }
}
