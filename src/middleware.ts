import { Middleware } from "redux";

import { RootState } from "./index";

export const logger: Middleware<Record<string, unknown>, RootState> = ({
  getState,
}) => {
  return (next) => (action) => {
    console.log("[Redux Logger] will dispatch", action);

    // @ts-ignore
    const returnValue = next(action);

    console.log("[Redux Logger] state after dispatch", getState());

    return returnValue;
  };
};
