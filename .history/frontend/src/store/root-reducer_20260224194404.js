// frontend/src/store/root-reducer.js
import { combineReducers } from "@reduxjs/toolkit";
import { authReducer as auth } from "./slices/auth";
import { userReducer as user } from "./slices/user";
import { uiReducer as ui } from "./slices/ui";
import { notificationsReducer as notifications } from "./slices/notifications";
export const reducers = {
  auth,
  user,
  ui,
  notifications,
};

export const rootReducer = combineReducers(reducers);

