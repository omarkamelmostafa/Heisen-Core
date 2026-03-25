// frontend/src/store/slices/ui/notification/notification-selectors.js

export const selectNotificationState = (state) => state.ui.notification;

export const selectNotificationItems = (state) => state.ui.notification.items;
export const selectToast = (state) => state.ui.notification.toast;
export const selectIsToastVisible = (state) => state.ui.notification.toast.visible;
