// frontend/src/store/slices/ui/navigation/navigation-slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  layout: {
    sidebar: {
      collapsed: false,
      width: 260,
      collapsedWidth: 80,
    },
    header: {
      visible: true,
      height: 64,
    },
    footer: {
      visible: true,
    },
  },
  navigation: {
    currentPage: "",
    previousPage: "",
    breadcrumbs: [],
    backButton: {
      visible: false,
      target: null,
    },
  },
  scroll: {
    positions: {},
    locked: false,
  },
  errors: {
    boundaryErrors: {},
    globalError: null,
  },
};

const navigationSlice = createSlice({
  name: "ui/navigation",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.layout.sidebar.collapsed = !state.layout.sidebar.collapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.layout.sidebar.collapsed = action.payload;
    },
    updateLayout: (state, action) => {
      state.layout = { ...state.layout, ...action.payload };
    },
    setCurrentPage: (state, action) => {
      state.navigation.previousPage = state.navigation.currentPage;
      state.navigation.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.navigation.breadcrumbs = action.payload;
    },
    setBackButton: (state, action) => {
      state.navigation.backButton = {
        ...state.navigation.backButton,
        ...action.payload,
      };
    },
    setScrollPosition: (state, action) => {
      const { path, position } = action.payload;
      state.scroll.positions[path] = position;
    },
    setScrollLock: (state, action) => {
      state.scroll.locked = action.payload;
    },
    setComponentError: (state, action) => {
      const { componentId, error } = action.payload;
      state.errors.boundaryErrors[componentId] = error;
    },
    clearComponentError: (state, action) => {
      const componentId = action.payload;
      delete state.errors.boundaryErrors[componentId];
    },
    setGlobalError: (state, action) => {
      state.errors.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.errors.globalError = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  updateLayout,
  setCurrentPage,
  setBreadcrumbs,
  setBackButton,
  setScrollPosition,
  setScrollLock,
  setComponentError,
  clearComponentError,
  setGlobalError,
  clearGlobalError,
} = navigationSlice.actions;

export default navigationSlice.reducer;
