// frontend/src/services/ui/toast-service.js

/**
 * Toast Notification Service
 * Handles temporary UI feedback messages (success, error, info, warning)
 * Messages auto-dismiss after a few seconds
 */

import StoreAccessor from "@/store/store-accessor";
import { showToast, hideToast } from "@/store/slices/ui";

class ToastService {
  constructor() {
    this.defaultDuration = {
      success: 3000, // 3 seconds
      error: 5000,   // 5 seconds  
      warning: 4000, // 4 seconds
      info: 3000     // 3 seconds
    };
  }

  // ==================== CORE METHODS ====================

  /**
   * Show success toast
   */
  success(message, duration = this.defaultDuration.success) {
    this.showToast('success', message, duration);
  }

  /**
   * Show error toast  
   */
  error(message, duration = this.defaultDuration.error) {
    this.showToast('error', message, duration);
  }

  /**
   * Show warning toast
   */
  warning(message, duration = this.defaultDuration.warning) {
    this.showToast('warning', message, duration);
  }

  /**
   * Show info toast
   */
  info(message, duration = this.defaultDuration.info) {
    this.showToast('info', message, duration);
  }

  /**
   * Core toast display method
   */
  showToast(type, message, duration) {
    const toastId = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    StoreAccessor.dispatch(showToast({
      id: toastId,
      type,
      message,
      duration
    }));

    // Auto hide after duration
    setTimeout(() => {
      this.hideToast(toastId);
    }, duration);

    return toastId;
  }

  /**
   * Manually hide a toast
   */
  hideToast(toastId) {
    StoreAccessor.dispatch(hideToast(toastId));
  }

  /**
   * Hide all toasts
   */
  hideAll() {
    const state = StoreAccessor.getState();
    state.ui.toasts.forEach(toast => {
      this.hideToast(toast.id);
    });
  }
}

// Singleton instance
export const toastService = new ToastService();
export default toastService;
