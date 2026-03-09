import { cookieService } from "@/services/storage/cookie-service";

// ==================== PRIMARY SELECTORS ====================
// Base selectors
export const selectAuth = (state) => state.auth;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthTokens = (state) => ({
  accessToken: cookieService.getAccessToken() || state.auth.tokens.accessToken,
  refreshToken: cookieService.getRefreshToken() || state.auth.tokens.refreshToken,
});
export const selectAccessToken = (state) => cookieService.getAccessToken() || state.auth.tokens.accessToken;
export const selectRefreshToken = (state) => cookieService.getRefreshToken() || state.auth.tokens.refreshToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Memoized/computed selectors
// export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserName = (state) =>
  state.auth.user?.name || state.auth.user?.email?.split("@")[0];
export const selectUserEmail = (state) => state.auth.user?.email;

// Compound selectors
export const selectAuthStatus = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading,
  error: state.auth.error,
});

// export const selectCanAccess = (roles) => (state) => {
//   if (!roles || roles.length === 0) return true;
//   const userRole = selectUserRole(state);
//   return roles.includes(userRole);
// };

// ==================== LATER ENHANCEMENT SELECTORS ====================
export const selectIsVerifying = (state) => state.auth.isVerifying;