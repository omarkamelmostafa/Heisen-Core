import { combineReducers } from "@reduxjs/toolkit";

// ─── Import Reducers ────────────────────────────────────────────────
import themeReducer from "./theme/theme-slice";
import layoutReducer from "./layout/layout-slice";
import modalReducer from "./modal/modal-slice";
import notificationReducer from "./notification/notification-slice";
import loadingReducer from "./loading/loading-slice";
import confirmationReducer from "./confirmation/confirmation-slice";
import navigationReducer from "./navigation/navigation-slice";
import scrollReducer from "./scroll/scroll-slice";
import formReducer from "./form/form-slice";
import searchReducer from "./search/search-slice";
import paginationReducer from "./pagination/pagination-slice";
import errorsReducer from "./errors/errors-slice";
import performanceReducer from "./performance/performance-slice";

// ─── Export Actions ─────────────────────────────────────────────────
export * from "./theme/theme-slice";
export * from "./layout/layout-slice";
export * from "./modal/modal-slice";
export * from "./notification/notification-slice";
export * from "./loading/loading-slice";
export * from "./confirmation/confirmation-slice";
export * from "./navigation/navigation-slice";
export * from "./scroll/scroll-slice";
export * from "./form/form-slice";
export * from "./search/search-slice";
export * from "./pagination/pagination-slice";
export * from "./errors/errors-slice";
export * from "./performance/performance-slice";

// ─── Export Selectors ───────────────────────────────────────────────
export * from "./theme/theme-selectors";
export * from "./layout/layout-selectors";
export * from "./modal/modal-selectors";
export * from "./notification/notification-selectors";
export * from "./loading/loading-selectors";
export * from "./confirmation/confirmation-selectors";
export * from "./navigation/navigation-selectors";
export * from "./scroll/scroll-selectors";
export * from "./form/form-selectors";
export * from "./search/search-selectors";
export * from "./pagination/pagination-selectors";
export * from "./errors/errors-selectors";
export * from "./performance/performance-selectors";

// ─── Export Thunks ──────────────────────────────────────────────────
export * from "./ui-thunks";

// ─── Combine under 'ui' namespace ───────────────────────────────────
// State shape: state.ui.theme, state.ui.layout, state.ui.modal, etc.
export const uiReducer = combineReducers({
  theme: themeReducer,
  layout: layoutReducer,
  modal: modalReducer,
  notification: notificationReducer,
  loading: loadingReducer,
  confirmation: confirmationReducer,
  navigation: navigationReducer,
  scroll: scrollReducer,
  form: formReducer,
  search: searchReducer,
  pagination: paginationReducer,
  errors: errorsReducer,
  performance: performanceReducer,
});

export default uiReducer;