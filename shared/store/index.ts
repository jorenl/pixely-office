import { Store as ReduxStore } from "redux";
import { State } from "./state";
import { Action } from "./actions";

export { State } from "./state";
export { Action } from "./actions";
export { rootReducer } from "./reducers";

export type Store = ReduxStore<State, Action>;
