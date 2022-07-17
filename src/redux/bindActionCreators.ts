import { ActionCreator, ActionCreatorsMapObject, Dispatch } from "./types";

const bindActionCreators = (
  actionCreators: ActionCreator<any> | ActionCreatorsMapObject,
  dispatch: Dispatch
) => {
  const bounded: ActionCreatorsMapObject = {};

  for (const key in actionCreators) {
    // @ts-ignore - bad
    const actionCreator = actionCreators[key];
    bounded[key] = function boundedActionCreator(...args) {
      return dispatch(actionCreator.apply(this, args));
    };
  }

  return bounded;
};

export default bindActionCreators;
