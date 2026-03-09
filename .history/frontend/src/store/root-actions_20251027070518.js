// frontend/src/store/root-actions.js
// Centralized action exports for better imports
export {
  login,
  logout,
  refreshToken,
  clearAuthError,
} from "./modules/auth/auth-thunks";

export { setUser, updateProfile, clearUser } from "./modules/user/user-thunks";

export {
  setLoading,
  setNotification,
  clearNotification,
} from "./modules/ui/ui-thunks";

// Re-export all actions for clean imports
export * from "./modules/auth";
export * from "./modules/user";
export * from "./modules/ui";
export * from "./modules/api";
