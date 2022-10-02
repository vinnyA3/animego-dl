import { AnyAction as Action } from "redux";

export const makeActionCreator = (type: string, ...argNames: string[]) => {
  return function actionGenerator(...args: any[]): Action {
    const action = { type };

    argNames.forEach((_, index) => {
      // @ts-ignore
      action[argNames[index]] = args[index];
    });

    return action;
  };
};

export default {
  makeActionCreator,
};
