// frontend/src/store/slices/ui/ui-slice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * Enterprise UI State Management
 * Handles all UI-related state including themes, modals, notifications,
 * loading states, navigation, and user interface preferences.
 */

// Initial state with comprehensive UI configuration
const initialState = {
  // ==================== THEME & APPEARANCE ====================
  theme: {
    mode: "light", // 'light' | 'dark' | 'system'
    primaryColor: "#3B82F6", // Brand color
    secondaryColor: "#6366F1", // Secondary brand color
    borderRadius: "8px", // Border radius for components
    fontFamily: "Inter, sans-serif",
  },

  // ==================== LAYOUT & NAVIGATION ====================
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

  // ==================== MODAL MANAGEMENT ====================
  modals: {
    // Active modals with their props
    active: [],
    // Modal history for navigation
    history: [],
  },

  // ==================== NOTIFICATION SYSTEM ====================
  notifications: {
    items: [],
    position: "top-right", // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    autoClose: 5000, // Default auto-close duration
    maxVisible: 5, // Maximum notifications visible at once
  },

  // ==================== LOADING STATES ====================
  loading: {
    global: false,
    page: false,
    buttons: {}, // Specific button loading states: { 'submit-button': true }
    sections: {}, // Section-specific loading: { 'user-profile': true }
  },

  // ==================== TOAST & SNACKBAR ====================
  toast: {
    visible: false,
    message: "",
    type: "info", // 'info' | 'success' | 'warning' | 'error'
    duration: 3000,
  },

  // ==================== DIALOG & CONFIRMATION ====================
  confirmation: {
    visible: false,
    title: "",
    message: "",
    type: "warning", // 'info' | 'warning' | 'danger'
    confirmText: "Confirm",
    cancelText: "Cancel",
    callbackId: null,
  },

  // ==================== NAVIGATION & BREADCRUMB ====================
  navigation: {
    currentPage: "",
    previousPage: "",
    breadcrumbs: [],
    backButton: {
      visible: false,
      target: null,
    },
  },

  // ==================== RESPONSIVE & DEVICE ====================
  responsive: {
    screenSize: "desktop", // 'mobile' | 'tablet' | 'desktop' | 'xl'
    orientation: "landscape", // 'portrait' | 'landscape'
    touchDevice: false,
  },

  // ==================== SCROLL & VIEWPORT ====================
  scroll: {
    positions: {}, // { '/page': 250 }
    locked: false, // Prevent scrolling
  },

  // ==================== FORM STATES ====================
  forms: {
    dirty: {}, // Track dirty forms: { 'user-form': true }
    submitting: {}, // Form submission states
    errors: {}, // Form-level errors
  },

  // ==================== SEARCH & FILTER ====================
  search: {
    queries: {}, // Active search queries: { 'users': 'john' }
    filters: {}, // Active filters: { 'users': { role: 'admin' } }
    sort: {}, // Sort configurations: { 'users': { field: 'name', order: 'asc' } }
  },

  // ==================== PAGINATION ====================
  pagination: {
    pages: {}, // Current pages: { 'users': 1 }
    limits: {}, // Items per page: { 'users': 10 }
    totals: {}, // Total items: { 'users': 150 }
  },

  // ==================== USER PREFERENCES ====================
  preferences: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },

  // ==================== ERROR BOUNDARIES ====================
  errors: {
    boundaryErrors: {}, // Component-level errors: { 'ComponentName': error }
    globalError: null, // Global application error
  },

  // ==================== PERFORMANCE & DEBUG ====================
  performance: {
    metrics: {
      pageLoadTime: 0,
      apiResponseTime: 0,
    },
    debug: {
      enabled: process.env.NODE_ENV === "development",
      reduxLogging: false,
      apiLogging: false,
    },
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // ==================== THEME ACTIONS ====================
    setThemeMode: (state, action) => {
      state.theme.mode = action.payload;
    },

    toggleTheme: (state) => {
      state.theme.mode = state.theme.mode === "light" ? "dark" : "light";
    },

    updateThemeColors: (state, action) => {
      state.theme = { ...state.theme, ...action.payload };
    },

    // ==================== LAYOUT ACTIONS ====================
    toggleSidebar: (state) => {
      state.layout.sidebar.collapsed = !state.layout.sidebar.collapsed;
    },

    setSidebarCollapsed: (state, action) => {
      state.layout.sidebar.collapsed = action.payload;
    },

    updateLayout: (state, action) => {
      state.layout = { ...state.layout, ...action.payload };
    },

    // ==================== MODAL ACTIONS ====================
    openModal: (state, action) => {
      const { id, props = {} } = action.payload;

      // Add to active modals
      state.modals.active.push({ id, props });

      // Add to history
      state.modals.history.push({ id, timestamp: Date.now() });
    },

    closeModal: (state, action) => {
      const modalId = action.payload;

      // Remove from active modals
      state.modals.active = state.modals.active.filter(
        (modal) => modal.id !== modalId
      );
    },

    closeAllModals: (state) => {
      state.modals.active = [];
    },

    closeLastModal: (state) => {
      state.modals.active.pop();
    },

    // ==================== NOTIFICATION ACTIONS ====================
    showNotification: (state, action) => {
      const notification = {
        id: `notification-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: Date.now(),
        type: "info",
        autoClose: state.notifications.autoClose,
        ...action.payload,
      };

      // Add to notifications
      state.notifications.items.push(notification);

      // Limit visible notifications
      if (state.notifications.items.length > state.notifications.maxVisible) {
        state.notifications.items.shift();
      }
    },

    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.notifications.items = state.notifications.items.filter(
        (notification) => notification.id !== notificationId
      );
    },

    clearNotifications: (state) => {
      state.notifications.items = [];
    },

    updateNotificationPosition: (state, action) => {
      state.notifications.position = action.payload;
    },

    // ==================== LOADING ACTIONS ====================
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },

    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },

    setButtonLoading: (state, action) => {
      const { buttonId, isLoading } = action.payload;
      state.loading.buttons[buttonId] = isLoading;
    },

    setSectionLoading: (state, action) => {
      const { sectionId, isLoading } = action.payload;
      state.loading.sections[sectionId] = isLoading;
    },

    clearLoadingStates: (state) => {
      state.loading.buttons = {};
      state.loading.sections = {};
    },

    // ==================== TOAST ACTIONS ====================
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

    // ==================== CONFIRMATION DIALOG ACTIONS ====================
    showConfirmation: (state, action) => {
      state.confirmation = {
        ...state.confirmation,
        visible: true,
        ...action.payload,
      };
    },

    hideConfirmation: (state) => {
      state.confirmation.visible = false;
    },

    // ==================== NAVIGATION ACTIONS ====================
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

    // ==================== RESPONSIVE ACTIONS ====================
    setScreenSize: (state, action) => {
      state.responsive.screenSize = action.payload;
    },

    setOrientation: (state, action) => {
      state.responsive.orientation = action.payload;
    },

    setTouchDevice: (state, action) => {
      state.responsive.touchDevice = action.payload;
    },

    // ==================== SCROLL ACTIONS ====================
    setScrollPosition: (state, action) => {
      const { path, position } = action.payload;
      state.scroll.positions[path] = position;
    },

    setScrollLock: (state, action) => {
      state.scroll.locked = action.payload;
    },

    // ==================== FORM ACTIONS ====================
    setFormDirty: (state, action) => {
      const { formId, isDirty } = action.payload;
      state.forms.dirty[formId] = isDirty;
    },

    setFormSubmitting: (state, action) => {
      const { formId, isSubmitting } = action.payload;
      state.forms.submitting[formId] = isSubmitting;
    },

    setFormError: (state, action) => {
      const { formId, error } = action.payload;
      state.forms.errors[formId] = error;
    },

    clearFormState: (state, action) => {
      const formId = action.payload;
      delete state.forms.dirty[formId];
      delete state.forms.submitting[formId];
      delete state.forms.errors[formId];
    },

    // ==================== SEARCH & FILTER ACTIONS ====================
    setSearchQuery: (state, action) => {
      const { context, query } = action.payload;
      state.search.queries[context] = query;
    },

    setFilters: (state, action) => {
      const { context, filters } = action.payload;
      state.search.filters[context] = filters;
    },

    setSort: (state, action) => {
      const { context, field, order } = action.payload;
      state.search.sort[context] = { field, order };
    },

    clearSearch: (state, action) => {
      const context = action.payload;
      delete state.search.queries[context];
      delete state.search.filters[context];
      delete state.search.sort[context];
    },

    // ==================== PAGINATION ACTIONS ====================
    setPage: (state, action) => {
      const { context, page } = action.payload;
      state.pagination.pages[context] = page;
    },

    setLimit: (state, action) => {
      const { context, limit } = action.payload;
      state.pagination.limits[context] = limit;
    },

    setTotal: (state, action) => {
      const { context, total } = action.payload;
      state.pagination.totals[context] = total;
    },

    // ==================== PREFERENCE ACTIONS ====================
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    toggleReducedMotion: (state) => {
      state.preferences.reducedMotion = !state.preferences.reducedMotion;
    },

    toggleHighContrast: (state) => {
      state.preferences.highContrast = !state.preferences.highContrast;
    },

    // ==================== ERROR ACTIONS ====================
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

    // ==================== PERFORMANCE ACTIONS ====================
    setPerformanceMetric: (state, action) => {
      const { metric, value } = action.payload;
      state.performance.metrics[metric] = value;
    },

    toggleReduxLogging: (state) => {
      state.performance.debug.reduxLogging =
        !state.performance.debug.reduxLogging;
    },

    toggleApiLogging: (state) => {
      state.performance.debug.apiLogging = !state.performance.debug.apiLogging;
    },

    // ==================== RESET ACTIONS ====================
    resetUIState: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Keep theme preferences
        layout: state.layout, // Keep layout preferences
        preferences: state.preferences, // Keep user preferences
      };
    },

    resetTransientUI: (state) => {
      // Reset temporary UI states while keeping preferences
      state.modals.active = [];
      state.notifications.items = [];
      state.loading = { ...initialState.loading };
      state.toast = { ...initialState.toast };
      state.confirmation = { ...initialState.confirmation };
      state.forms = { ...initialState.forms };

      // Note: We can't clear the registry from here directly as it's a reducer,
      // but we should ideally do it in a thunk or middleware if needed.
    },
  },
});

// Export actions
export const {
  // Theme
  setThemeMode,
  toggleTheme,
  updateThemeColors,

  // Layout
  toggleSidebar,
  setSidebarCollapsed,
  updateLayout,

  // Modals
  openModal,
  closeModal,
  closeAllModals,
  closeLastModal,

  // Notifications
  showNotification,
  removeNotification,
  clearNotifications,
  updateNotificationPosition,

  // Loading
  setGlobalLoading,
  setPageLoading,
  setButtonLoading,
  setSectionLoading,
  clearLoadingStates,

  // Toast
  showToast,
  hideToast,

  // Confirmation
  showConfirmation,
  hideConfirmation,

  // Navigation
  setCurrentPage,
  setBreadcrumbs,
  setBackButton,

  // Responsive
  setScreenSize,
  setOrientation,
  setTouchDevice,

  // Scroll
  setScrollPosition,
  setScrollLock,

  // Forms
  setFormDirty,
  setFormSubmitting,
  setFormError,
  clearFormState,

  // Search & Filter
  setSearchQuery,
  setFilters,
  setSort,
  clearSearch,

  // Pagination
  setPage,
  setLimit,
  setTotal,

  // Preferences
  updatePreferences,
  toggleReducedMotion,
  toggleHighContrast,

  // Errors
  setComponentError,
  clearComponentError,
  setGlobalError,
  clearGlobalError,

  // Performance
  setPerformanceMetric,
  toggleReduxLogging,
  toggleApiLogging,

  // Reset
  resetUIState,
  resetTransientUI,
} = uiSlice.actions;

export default uiSlice.reducer;
