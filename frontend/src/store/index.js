// frontend/src/store/index.js

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { reducers } from "./root-reducer";

// ==================== SSR-COMPATIBLE STORAGE ====================

// Create a no-op storage for SSR
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Use web storage on client, no-op storage on server
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const sessionStorage =
  typeof window !== "undefined"
    ? createWebStorage("session")
    : createNoopStorage();

// ==================== PERSIST CONFIGURATION ====================

// Persist config for auth (session storage - more secure)
const authPersistConfig = {
  key: "auth",
  storage: sessionStorage,
  whitelist: ["isAuthenticated"], // Only persist auth status, tokens are in cookies
};

// Create persisted reducers out of the plain reducers map
const persistedRootReducer = {
  ...reducers,
  auth: persistReducer(authPersistConfig, reducers.auth),
  user: reducers.user,
  // keep other slices (ui) as plain reducers
  ui: reducers.ui,
};

// ==================== STORE CONFIGURATION ====================
export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
export default store;
