// frontend/src/store/slices/ui/loading/loading-slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  global: false,
  page: false,
  buttons: {},
  sections: {},
};

const loadingSlice = createSlice({
  name: "ui/loading",
  initialState,
  reducers: {
    setGlobalLoading: (state, action) => {
      state.global = action.payload;
    },
    setPageLoading: (state, action) => {
      state.page = action.payload;
    },
    setButtonLoading: (state, action) => {
      const { buttonId, isLoading } = action.payload;
      state.buttons[buttonId] = isLoading;
    },
    setSectionLoading: (state, action) => {
      const { sectionId, isLoading } = action.payload;
      state.sections[sectionId] = isLoading;
    },
    clearLoadingStates: (state) => {
      state.buttons = {};
      state.sections = {};
    },
  },
});

export const {
  setGlobalLoading,
  setPageLoading,
  setButtonLoading,
  setSectionLoading,
  clearLoadingStates,
} = loadingSlice.actions;

export default loadingSlice.reducer;
