// Performance selectors
export const selectPerformance = (state) => state.ui.performance;
export const selectPerformanceMetrics = (state) => state.ui.performance.metrics;
export const selectDebugSettings = (state) => state.ui.performance.debug;

export const selectPageLoadTime = (state) =>
  state.ui.performance.metrics.pageLoadTime;

export const selectApiResponseTime = (state) =>
  state.ui.performance.metrics.apiResponseTime;

export const selectReduxLoggingEnabled = (state) =>
  state.ui.performance.debug.reduxLogging;

export const selectApiLoggingEnabled = (state) =>
  state.ui.performance.debug.apiLogging;
