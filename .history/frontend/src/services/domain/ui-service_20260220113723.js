// frontend/src/services/domain/ui-service.js

/**
 * UI Service - Centralized UI state management
 * Handles modals, loading states, theme, and other UI concerns
 */

import StoreAccessor from "@/store/store-accessor";
import {
  showModal,
  hideModal,
  setLoading,
  setTheme,
  setSidebarOpen
} from "@/store/slices/ui"; // You'll need this slice

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

    StoreAccessor.dispatch(showModal({
      id: modalId,
      type: modalType,
      data: modalData,
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
      StoreAccessor.dispatch(hideModal(idToHide));
    }
  }

  /**
   * Hide all modals
   */
  hideAllModals() {
    this.modalStack.forEach(modalId => {
      StoreAccessor.dispatch(hideModal(modalId));
    });
    this.modalStack = [];
  }

  /**
   * Show confirmation dialog
   */
  confirm(options) {
    return new Promise((resolve) => {
      this.showModal('confirmation', {
        ...options,
        onConfirm: () => {
          this.hideModal();
          resolve(true);
        },
        onCancel: () => {
          this.hideModal();
          resolve(false);
        }
      });
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

  // ==================== THEME MANAGEMENT ====================

  /**
   * Set application theme
   */
  setTheme(theme) {
    StoreAccessor.dispatch(setTheme(theme));

    // Persist to localStorage
    localStorage.setItem('app-theme', theme);

    // Apply to document
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Get current theme
   */
  getTheme() {
    const state = StoreAccessor.getState();
    return state.ui.theme || 'light';
  }

  /**
   * Toggle between light/dark theme
   */
  toggleTheme() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Initialize theme from user preferences
   */
  initializeTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.setTheme(theme);
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
      // Fallback for older browsers
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




// 🎯 Usage Examples for UI Service:

// In your components:
// import { uiService, toastService } from '@/services/domain';

// // 1. Modals
// const handleDelete = async () => {
//   const confirmed = await uiService.confirm({
//     title: 'Delete Post',
//     message: 'Are you sure you want to delete this post?',
//     confirmText: 'Delete',
//     cancelText: 'Cancel'
//   });

//   if (confirmed) {
//     await api.deletePost(postId);
//     toastService.success('Post deleted');
//   }
// };

// 2. Loading states
// const handleSubmit = async (data) => {
//   await uiService.withLoading(
//     () => api.submitForm(data),
//     'Submitting form...'
//   );
//   toastService.success('Form submitted!');
// };

// 3. Theme
// const handleThemeToggle = () => {
//   uiService.toggleTheme();
// };

// 4. Responsive
// const MyComponent = () => {
//   const [isMobile, setIsMobile] = useState(uiService.isMobile());

//   useEffect(() => {
//     const handleResize = () => setIsMobile(uiService.isMobile());
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);
// };