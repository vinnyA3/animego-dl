import {
  Reducer,
  StoreT,
  Action,
  Middleware,
  MiddlewareAPI,
  Dispatch,
} from "./types";

const applyMiddleware = (...middlewares: Middleware[]) => {
  return (createStore: (reducer: Reducer) => StoreT) => (reducer: Reducer) => {
    const store = createStore(reducer);

    return {
      ...store,
      dispatch: function dispatch(action: Action): Dispatch {
        // @ts-ignore
        return middlewares(store)(store.dispatch)(action);
      },
    } as MiddlewareAPI;
  };
};

export default applyMiddleware;
