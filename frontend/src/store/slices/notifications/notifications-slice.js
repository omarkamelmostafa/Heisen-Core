// frontend/src/store/slices/notifications/notifications-slice.js

import { createSlice } from "@reduxjs/toolkit";

/**
 * Persistent Activity Notifications Slice
 * Handles persistent notifications (likes, comments, shares, follows)
 * that stay until manually read/cleared by the user.
 *
 * NOTE: This is SEPARATE from ui/notification which handles transient
 * UI notifications (toasts, auto-dismissing alerts).
 */

const initialState = {
  items: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    /**
     * Add a new activity notification
     */
    addNotification: (state, action) => {
      state.items.unshift(action.payload); // newest first
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.items.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },

    /**
     * Bulk set notifications (e.g., from cache or API)
     */
    setNotifications: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },

    /**
     * Remove a single notification
     */
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.items.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter((n) => n.id !== notificationId);
    },

    /**
     * Clear all notifications
     */
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  setNotifications,
  removeNotification,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
