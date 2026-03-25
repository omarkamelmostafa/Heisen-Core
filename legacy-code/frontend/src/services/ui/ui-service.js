// frontend/src/services/ui/ui-service.js

/**
 * UI Service - Centralized UI state management
 * Handles modals, loading states, theme, and other UI concerns
 */

import StoreAccessor from "@/store/store-accessor";
import {
  openModal,
  closeModal,
  setPageLoading as setLoading,
  setSidebarCollapsed as setSidebarOpen,
  showConfirmation,
  hideConfirmation
} from "@/store/slices/ui";
import { modalCallbackRegistry } from "@/lib/utils/modal-callback-registry";

class UIService {
  constructor() {
    this.modalStack = [];
  }

  // ==================== MODAL MANAGEMENT ====================

  /**
   * Show modal with optional data
   */
  showModal(modalType, modalData = {}) {
    const modalId = `modal_${Date.now()}`;

    StoreAccessor.dispatch(openModal({
      id: modalId,
      type: modalType,
      props: modalData,
      isOpen: true
    }));

    this.modalStack.push(modalId);
    return modalId;
  }

  /**
   * Hide current modal
   */
  hideModal(modalId = null) {
    const idToHide = modalId || this.modalStack.pop();

    if (idToHide) {
      StoreAccessor.dispatch(closeModal(idToHide));
    }
  }

  /**
   * Hide all modals
   */
  hideAllModals() {
    this.modalStack.forEach(modalId => {
      StoreAccessor.dispatch(closeModal(modalId));
    });
    this.modalStack = [];
  }

  /**
   * Show confirmation dialog
   */
  confirm(options) {
    return new Promise((resolve) => {
      const callbackId = modalCallbackRegistry.register(
        () => {
          StoreAccessor.dispatch(hideConfirmation());
          resolve(true);
        },
        () => {
          StoreAccessor.dispatch(hideConfirmation());
          resolve(false);
        }
      );

      StoreAccessor.dispatch(showConfirmation({
        ...options,
        callbackId
      }));
    });
  }

  // ==================== LOADING STATES ====================

  /**
   * Show global loading spinner
   */
  showLoading(message = 'Loading...') {
    StoreAccessor.dispatch(setLoading({
      isLoading: true,
      message
    }));
  }

  /**
   * Hide global loading spinner
   */
  hideLoading() {
    StoreAccessor.dispatch(setLoading({
      isLoading: false,
      message: ''
    }));
  }

  /**
   * Execute function with loading state
   */
  async withLoading(operation, message = 'Loading...') {
    this.showLoading(message);
    try {
      const result = await operation();
      return result;
    } finally {
      this.hideLoading();
    }
  }



  // ==================== LAYOUT MANAGEMENT ====================

  /**
   * Set sidebar open/closed state
   */
  setSidebarOpen(isOpen) {
    StoreAccessor.dispatch(setSidebarOpen(isOpen));
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    const state = StoreAccessor.getState();
    this.setSidebarOpen(!state.ui.isSidebarOpen);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Scroll to top smoothly
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Scroll to element
   */
  scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.offsetTop + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }

  // ==================== RESPONSIVE HELPERS ====================

  /**
   * Check if screen is mobile size
   */
  isMobile() {
    return window.innerWidth < 768;
  }

  /**
   * Check if screen is tablet size
   */
  isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  }

  /**
   * Check if screen is desktop size
   */
  isDesktop() {
    return window.innerWidth >= 1024;
  }

  /**
   * Get current breakpoint
   */
  getBreakpoint() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}

// Singleton instance
export const uiService = new UIService();
export default uiService;
