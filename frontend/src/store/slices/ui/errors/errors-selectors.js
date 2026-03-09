// Error selectors
export const selectErrors = (state) => state.ui.errors;
export const selectBoundaryErrors = (state) => state.ui.errors.boundaryErrors;
export const selectGlobalError = (state) => state.ui.errors.globalError;

export const selectComponentError = (componentId) => (state) =>
  state.ui.errors.boundaryErrors[componentId];

export const selectHasGlobalError = (state) => !!state.ui.errors.globalError;

export const selectHasAnyComponentError = (state) =>
  Object.keys(state.ui.errors.boundaryErrors).length > 0;
