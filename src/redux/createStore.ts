import { Action, Reducer, StoreT, Listener, ExtendState } from "./types";

class Store {
  static instance?: Record<string, unknown>;
  static getInstance() {
    if (!Store.instance) {
      Store.instance = {};
    }

    return Store.instance;
  }

  constructor() {
    throw new Error("Please use Store.getInstance()");
  }
}

const createStore = <
  S,
  A extends Action,
  Ext = Record<string, unknown>,
  StateExt = never
>(
  reducer: Reducer
): StoreT<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext => {
  const listeners: Listener[] = [];
  let state = Store.getInstance();

  const getState = () => state;

  const dispatch = (action: Action) => {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
    return action;
  };

  const subscribe = (listener: Listener) => {
    listeners.push(listener);
    return function unsubscribe() {
      const idx = listeners.indexOf(listener);
      listeners.splice(idx, 1);
    };
  };

  const store = {
    getState,
    dispatch,
    subscribe,
  } as unknown as StoreT<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext;

  return store;
};

export default createStore;
