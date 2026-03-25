// frontend/src/store/slices/ui/layout/layout-slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
  responsive: {
    screenSize: "desktop",
    orientation: "landscape",
    touchDevice: false,
  },
};

const layoutSlice = createSlice({
  name: "ui/layout",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.collapsed = !state.sidebar.collapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebar.collapsed = action.payload;
    },
    updateLayout: (state, action) => {
      return { ...state, ...action.payload };
    },
    setScreenSize: (state, action) => {
      state.responsive.screenSize = action.payload;
    },
    setOrientation: (state, action) => {
      state.responsive.orientation = action.payload;
    },
    setTouchDevice: (state, action) => {
      state.responsive.touchDevice = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  updateLayout,
  setScreenSize,
  setOrientation,
  setTouchDevice,
} = layoutSlice.actions;

export default layoutSlice.reducer;
