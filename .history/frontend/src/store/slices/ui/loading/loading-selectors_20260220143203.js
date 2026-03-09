export const selectLoadingState = (state) => state.ui.loading;

export const selectGlobalLoading = (state) => state.ui.loading.global;
export const selectPageLoading = (state) => state.ui.loading.page;
export const selectButtonLoading = (state) => state.ui.loading.buttons;
export const selectSectionLoading = (state) => state.ui.loading.sections;
export const selectIsButtonLoading = (buttonId) => (state) =>
  !!state.ui.loading.buttons[buttonId];
