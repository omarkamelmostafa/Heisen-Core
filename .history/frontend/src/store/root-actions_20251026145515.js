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
