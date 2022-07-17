import { Action, StateFromReducersMapObject, ReducersMapObject } from "./types";

const combineReducers = (reducers: ReducersMapObject) => {
  const reducerKeys = Object.keys(reducers);

  function combined(state = {}, action: Action) {
    const nextState: StateFromReducersMapObject<typeof reducers> = {};

    reducerKeys.forEach((key: string) => {
      // @ts-ignore
      nextState[key] = reducers[key](state[key], action);
    });

    return nextState;
  }

  return combined;
};

export default combineReducers;
