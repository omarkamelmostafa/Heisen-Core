import { showNotification, setGlobalLoading, hideToast, showConfirmation, hideConfirmation, removeNotification, setCurrentPage, resetTransientUI, setScreenSize, setOrientation, setTouchDevice } from "./ui-slice";
import { modalCallbackRegistry } from "@/lib/utils/modal-callback-registry";

/**
 * UI-related thunks for complex UI operations
 */

// Show a notification with auto-remove
export const showTemporaryNotification = (notification) => (dispatch) => {
  const notificationId = `notification-${Date.now()}`;

  dispatch(
    showNotification({
      ...notification,
      id: notificationId,
    })
  );

  // Auto-remove after duration
  if (notification.autoClose !== false) {
    setTimeout(() => {
      dispatch(removeNotification(notificationId));
    }, notification.duration || 5000);
  }
};

// Show success notification
export const showSuccessNotification = (message, title = "Success") =>
  showTemporaryNotification({
    type: "success",
    title,
    message,
  });

// Show error notification
export const showErrorNotification = (message, title = "Error") =>
  showTemporaryNotification({
    type: "error",
    title,
    message,
  });

// Show loading with timeout protection
export const showLoadingWithTimeout =
  (timeout = 30000) =>
    (dispatch) => {
      dispatch(setGlobalLoading(true));

      // Auto-hide loading after timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        dispatch(setGlobalLoading(false));
        dispatch(showErrorNotification("Request timed out", "Timeout"));
      }, timeout);

      // Return function to clear loading
      return () => {
        clearTimeout(timeoutId);
        dispatch(setGlobalLoading(false));
      };
    };

// Confirm action with promise
export const confirmAction = (config) => (dispatch) => {
  return new Promise((resolve) => {
    const callbackId = modalCallbackRegistry.register(
      () => {
        dispatch(hideConfirmation());
        resolve(true);
      },
      () => {
        dispatch(hideConfirmation());
        resolve(false);
      }
    );

    dispatch(
      showConfirmation({
        ...config,
        callbackId
      })
    );
  });
};

// Toast with auto-hide
export const showTemporaryToast = (toastConfig) => (dispatch) => {
  dispatch(showToast(toastConfig));

  setTimeout(() => {
    dispatch(hideToast());
  }, toastConfig.duration || 3000);
};

// Track page view for analytics
export const trackPageView =
  (pageName, additionalData = {}) =>
    (dispatch, getState) => {
      const state = getState();

      dispatch(setCurrentPage(pageName));

      // You can integrate with analytics services here
      if (state.ui.performance.debug.enabled) {
        console.log(`Page View: ${pageName}`, additionalData);
      }

      // Reset transient UI for new page
      modalCallbackRegistry.clearAll();
      dispatch(resetTransientUI());
    };

// Initialize responsive detection
export const initializeResponsiveDetection = () => (dispatch) => {
  const updateScreenSize = () => {
    const width = window.innerWidth;
    let screenSize = "desktop";

    if (width < 768) screenSize = "mobile";
    else if (width < 1024) screenSize = "tablet";
    else if (width < 1440) screenSize = "desktop";
    else screenSize = "xl";

    dispatch(setScreenSize(screenSize));
  };

  const updateOrientation = () => {
    const orientation =
      window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    dispatch(setOrientation(orientation));
  };

  const updateTouchDevice = () => {
    const touchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    dispatch(setTouchDevice(touchDevice));
  };

  // Initial detection
  updateScreenSize();
  updateOrientation();
  updateTouchDevice();

  // Listen for changes
  window.addEventListener("resize", updateScreenSize);
  window.addEventListener("orientationchange", updateOrientation);

  // Return cleanup function
  return () => {
    window.removeEventListener("resize", updateScreenSize);
    window.removeEventListener("orientationchange", updateOrientation);
  };
};
