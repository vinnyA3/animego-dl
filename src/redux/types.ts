// Very little we can do (without crazy typing, to avoid using any for these types)
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface State {
  [key: string]: any /* state can be any object type - refine */;
}

export interface Action<T = any> {
  type: T;
  payload: any;
}

export interface ActionCreator<A, P extends any[] = any[]> {
  (...args: P): A;
}

export interface ActionCreatorsMapObject<A = any, P extends any[] = any[]> {
  [key: string]: ActionCreator<A, P>;
}

export interface AnyAction extends Action {
  [extraProps: string]: any;
}

export type Listener = () => void;

export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A
) => S;

export type ReducersMapObject<S = any, A extends Action = AnyAction> = {
  [K in keyof S]: Reducer<S[K], A>;
};

export type ReducerFromReducersMapObject<M> = M extends {
  [P in keyof M]: infer R;
}
  ? R extends Reducer<any, any>
    ? R
    : never
  : never;

export type StateFromReducersMapObject<M> = M extends ReducersMapObject
  ? { [P in keyof M]: M[P] extends Reducer<infer S, any> ? S : never }
  : never;

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T, ...extraArgs: any[]): T;
}

export interface MiddlewareAPI<D extends Dispatch = Dispatch, S = any> {
  dispatch: D;
  getState(): S;
}

export interface Middleware<
  _DispatchExt = Record<any, unknown>,
  S = any,
  D extends Dispatch = Dispatch
> {
  (api: MiddlewareAPI<D, S>): (
    next: D
  ) => (action: D extends Dispatch<infer A> ? A : never) => any;
}

export interface Unsubscribe {
  (): void;
}

export type ExtendState<State, Extension> = [Extension] extends [never]
  ? State
  : State & Extension;

export interface StoreT<
  S = any,
  A extends Action = AnyAction,
  StateExt = never,
  Ext = Record<string, unknown>
> {
  dispatch: Dispatch<A>;
  getState(): S;
  subscribe(listener: () => void): Unsubscribe;
}
