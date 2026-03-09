import { combineReducers } from "@reduxjs/toolkit";

// Import Reducers
import themeReducer from "./theme/theme-slice";
import modalReducer from "./modal/modal-slice";
import notificationReducer from "./notification/notification-slice";
import loadingReducer from "./loading/loading-slice";
import navigationReducer from "./navigation/navigation-slice";
import formReducer from "./form/form-slice";
import searchReducer from "./search/search-slice";
import paginationReducer from "./pagination/pagination-slice";

// Import Actions
export * from "./theme/theme-slice";
export * from "./modal/modal-slice";
export * from "./notification/notification-slice";
export * from "./loading/loading-slice";
export * from "./navigation/navigation-slice";
export * from "./form/form-slice";
export * from "./search/search-slice";
export * from "./pagination/pagination-slice";

// Import Selectors
export * from "./theme/theme-selectors";
export * from "./modal/modal-selectors";
export * from "./notification/notification-selectors";
export * from "./loading/loading-selectors";
export * from "./navigation/navigation-selectors";
export * from "./form/form-selectors";
export * from "./search/search-selectors";
export * from "./pagination/pagination-selectors";

// Import Thunks
export * from "./ui-thunks";

// Combine everything under the 'ui' namespace
// This maintains compatibility with state.ui.theme, state.ui.modal, etc.
const uiReducer = combineReducers({
  theme: themeReducer,
  modal: modalReducer,
  notification: notificationReducer,
  loading: loadingReducer,
  navigation: navigationReducer,
  form: formReducer,
  search: searchReducer,
  pagination: paginationReducer,
});

export default uiReducer;