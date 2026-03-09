import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boundaryErrors: {}, // { 'ComponentName': error }
  globalError: null,
};

const errorsSlice = createSlice({
  name: "ui/errors",
  initialState,
  reducers: {
    setComponentError: (state, action) => {
      const { componentId, error } = action.payload;
      state.boundaryErrors[componentId] = error;
    },
    clearComponentError: (state, action) => {
      const componentId = action.payload;
      delete state.boundaryErrors[componentId];
    },
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
  },
});

export const {
  setComponentError,
  clearComponentError,
  setGlobalError,
  clearGlobalError,
} = errorsSlice.actions;

export default errorsSlice.reducer;
