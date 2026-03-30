// frontend/src/store/store-accessor.js
/**
 * Store Accessor Utility
 * Helps decouple domain services and API clients from the Redux store singleton.
 * Prevents circular dependencies and improves testability.
 */

let store = null;

/**
 * Inject the store instance into the accessor.
 * This should be called during application initialization (e.g., in StoreProvider).
 */
export const injectStore = (injectedStore) => {
  store = injectedStore;
};

/**
 * Dispatch an action to the store.
 */
export const dispatch = (action) => {
  if (!store) {
    if (process.env.NODE_ENV === "development") {
      console.warn("StoreAccessor: Attempted to dispatch before store was injected.");
    }
    return;
  }
  return store.dispatch(action);
};

/**
 * Get the current state from the store.
 */
export const getState = () => {
  if (!store) {
    if (process.env.NODE_ENV === "development") {
      console.warn("StoreAccessor: Attempted to getState before store was injected.");
    }
    return {};
  }
  return store.getState();
};

/**
 * Subscribe to store changes.
 */
export const subscribe = (listener) => {
  if (!store) {
    if (process.env.NODE_ENV === "development") {
      console.warn("StoreAccessor: Attempted to subscribe before store was injected.");
    }
    return () => { };
  }
  return store.subscribe(listener);
};

const storeAccessor = {
  dispatch,
  getState,
  subscribe,
};

export default storeAccessor;
