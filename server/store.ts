import { createStore } from "redux";
import { Store, rootReducer } from "shared/store";

export function newStore(): Store {
  return createStore(rootReducer);
}
