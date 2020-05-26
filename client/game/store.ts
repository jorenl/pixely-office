import { createStore } from "redux";
import { Store, State, rootReducer, Action } from "shared/store";
import { getWsConnection } from "client/socket";

export function observeStore<T>(
  store: Store,
  select: (s: State) => T,
  onChange: (s: T) => void
) {
  let currentState: T;

  function handleChange() {
    let nextState = select(store.getState());
    if (nextState !== currentState) {
      currentState = nextState;
      onChange(currentState);
    }
  }

  let unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
}

export function newStore(): Store {
  return createStore(
    rootReducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  );
}

// singleton
const store = newStore();
export default store;

export function dispatchAndSend(action: Action) {
  getWsConnection().send({ type: "REDUX_ACTION", action });
  store.dispatch(action);
}

export function dispatch(action: Action) {
  store.dispatch(action);
}

export function getState() {
  return store.getState();
}
