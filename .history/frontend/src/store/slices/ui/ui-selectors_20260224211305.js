// frontend/src/store/slices/ui/ui-selectors.js
/**
 * Compound UI Selectors — Cross-domain selectors that aggregate state
 * from multiple sub-slices. Domain-specific selectors are co-located
 * with their respective sub-slices and exported from the barrel index.
 */

// ==================== BASE SELECTOR ====================

export const selectUI = (state) => state.ui;

// ==================== COMPOUND SELECTORS ====================

// UI state summary (aggregates across multiple sub-slices)
export const selectUIStatus = (state) => ({
  theme: state.ui.theme.mode,
  sidebarCollapsed: state.ui.layout.sidebar.collapsed,
  globalLoading: state.ui.loading.global,
  activeModals: state.ui.modal.active.length,
  notifications: state.ui.notification.items.length,
  screenSize: state.ui.theme.responsive.screenSize,
});

// Loading state summary
export const selectLoadingSummary = (state) => ({
  global: state.ui.loading.global,
  page: state.ui.loading.page,
  buttons: Object.keys(state.ui.loading.buttons).length,
  sections: Object.keys(state.ui.loading.sections).length,
  anyLoading:
    state.ui.loading.global ||
    state.ui.loading.page ||
    Object.keys(state.ui.loading.buttons).length > 0 ||
    Object.keys(state.ui.loading.sections).length > 0,
});

// Form state summary
export const selectFormSummary = (state) => ({
  dirtyForms: Object.keys(state.ui.form.dirty),
  submittingForms: Object.keys(state.ui.form.submitting),
  formsWithErrors: Object.keys(state.ui.form.errors),
});

// Accessibility preferences
export const selectAccessibilitySettings = (state) => ({
  reducedMotion: state.ui.theme.preferences.reducedMotion,
  highContrast: state.ui.theme.preferences.highContrast,
  largeText: state.ui.theme.preferences.largeText,
});