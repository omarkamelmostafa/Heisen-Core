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
  },
});

export const { toggleSidebar, setSidebarCollapsed, updateLayout } =
  layoutSlice.actions;

export default layoutSlice.reducer;
