// frontend/src/store/slices/ui/notification/notification-slice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  position: "top-right",
  autoClose: 5000,
  maxVisible: 5,
  toast: {
    visible: false,
    message: "",
    type: "info",
    duration: 3000,
  },
};

const notificationSlice = createSlice({
  name: "ui/notification",
  initialState,
  reducers: {
    showNotification: (state, action) => {
      const notification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: "info",
        autoClose: state.autoClose,
        ...action.payload,
      };
      state.items.push(notification);
      if (state.items.length > state.maxVisible) {
        state.items.shift();
      }
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.items = state.items.filter((n) => n.id !== notificationId);
    },
    clearNotifications: (state) => {
      state.items = [];
    },
    updateNotificationPosition: (state, action) => {
      state.position = action.payload;
    },
    showToast: (state, action) => {
      state.toast = {
        ...state.toast,
        visible: true,
        ...action.payload,
      };
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },
  },
});

export const {
  showNotification,
  removeNotification,
  clearNotifications,
  updateNotificationPosition,
  showToast,
  hideToast,
} = notificationSlice.actions;

export default notificationSlice.reducer;
