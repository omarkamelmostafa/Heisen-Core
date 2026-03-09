import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  metrics: {
    pageLoadTime: 0,
    apiResponseTime: 0,
  },
  debug: {
    enabled: process.env.NODE_ENV === "development",
    reduxLogging: false,
    apiLogging: false,
  },
};

const performanceSlice = createSlice({
  name: "ui/performance",
  initialState,
  reducers: {
    setPerformanceMetric: (state, action) => {
      const { metric, value } = action.payload;
      state.metrics[metric] = value;
    },
    toggleReduxLogging: (state) => {
      state.debug.reduxLogging = !state.debug.reduxLogging;
    },
    toggleApiLogging: (state) => {
      state.debug.apiLogging = !state.debug.apiLogging;
    },
  },
});

export const { setPerformanceMetric, toggleReduxLogging, toggleApiLogging } =
  performanceSlice.actions;

export default performanceSlice.reducer;
