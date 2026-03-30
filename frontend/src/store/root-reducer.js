// frontend/src/store/root-reducer.js
import { combineReducers } from "@reduxjs/toolkit";
import { authReducer as auth } from "./slices/auth";
import { userReducer as user } from "./slices/user";

export const reducers = {
  auth,
  user,
};

export const rootReducer = combineReducers(reducers);

