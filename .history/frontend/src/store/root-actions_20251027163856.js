// frontend/src/store/root-actions.js
// Centralized action exports for better imports
export * from "./slices/auth";
export * from "./slices/user";
export * from "./slices/ui";
export * from "./slices/api";

// export {
//   login,
//   logout,
//   refreshToken,
//   clearAuthError,
// } from "./slices/auth/auth-thunks";

// export { setUser, updateProfile, clearUser } from "./slices/user/user-thunks";

// export {
//   setLoading,
//   setNotification,
//   clearNotification,
// } from "./slices/ui/ui-thunks";

// // Re-export all actions for clean imports
// export * from "./slices/auth";
// export * from "./slices/user";
// export * from "./slices/ui";
// export * from "./slices/api";
