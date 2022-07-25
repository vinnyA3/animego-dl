import { Store } from "redux";

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

interface screenInitializer {
  init: (params?: unknown) => this;
}

export type Screen = WithNavigatorT<screenInitializer>;
