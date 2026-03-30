// frontend/src/store/slices/auth/auth-thunks.js
import { authService } from "@/services/domain/auth-service";
import { tokenManager } from "@/services/auth/token-manager";
import { refreshQueue } from "@/services/api/refresh-queue";
import { createAppThunk } from "@/store/utils/thunk-utils";
import {
  logout,
  setAccessToken,
  setUser,
} from "./auth-slice";

// ==================== PRIMARY THUNKS ====================

/**
 * Login — stores access token in Redux memory (FR-010).
 * The refresh token is set automatically via Set-Cookie by the backend.
 */
export const loginUser = createAppThunk(
  "auth/login",
  async (credentials, { signal }) => {
    const response = await authService.login(credentials, { signal });
    // The access token comes in the response body, NOT as a cookie.
    // The auth-slice extraReducer for loginUser.fulfilled stores it in Redux state.
    return response.data;
  },
  "Login failed"
);

/**
 * Register — does NOT auto-authenticate (user must verify email first).
 */
export const registerUser = createAppThunk(
  "auth/register",
  async (userData, { signal }) => {
    const response = await authService.register(userData, { signal });
    return response.data;
  },
  "Registration failed"
);

/**
 * Logout (current device) — clears session state and queued requests.
 */
export const logoutUser = createAppThunk(
  "auth/logout",
  async (_, { dispatch, signal }) => {
    try {
      refreshQueue.clearQueue();
      await authService.logout({ signal });
      tokenManager.clearSession(dispatch);
      return true;
    } catch (error) {
      // Even if API call fails, clear local state
      refreshQueue.clearQueue();
      tokenManager.clearSession(dispatch);
      throw error;
    }
  },
  "Logout failed"
);

/**
 * Logout from all devices — increments tokenVersion on backend.
 * Requires authenticated user (access token in Authorization header).
 */
export const logoutAllDevices = createAppThunk(
  "auth/logoutAll",
  async (_, { dispatch, signal }) => {
    try {
      refreshQueue.clearQueue();
      await authService.logoutAll({ signal });
      tokenManager.clearSession(dispatch);
      return true;
    } catch (error) {
      refreshQueue.clearQueue();
      tokenManager.clearSession(dispatch);
      throw error;
    }
  },
  "Logout from all devices failed"
);

/**
 * Bootstrap Auth — called on app initialization / page refresh.
 * Attempts to restore the session by calling the refresh endpoint.
 * If a valid refresh_token cookie exists, the backend returns a new
 * access token which gets stored in Redux memory.
 */
export const bootstrapAuth = createAppThunk(
  "auth/bootstrap",
  async (_, { dispatch }) => {
    const response = await authService.refreshToken();
    const { accessToken, user } = response.data?.data || {};

    if (accessToken) {
      dispatch(setAccessToken(accessToken));
    }
    if (user) {
      dispatch(setUser(user));
    }

    return response.data;
  },
  "Session restore failed"
);

// ==================== LATER ENHANCEMENT THUNKS ====================

/** Verify email */
export const verifyEmail = createAppThunk(
  "auth/verifyEmail",
  async (verificationData, { signal }) => {
    const response = await authService.verifyEmail(verificationData, {
      signal,
    });
    return response.data;
  },
  "Email verification failed"
);

/** Resend verification email */
export const resendVerification = createAppThunk(
  "auth/resendVerification",
  async (email, { signal }) => {
    const response = await authService.resendVerification(email, { signal });
    return response.data;
  },
  "Resend verification failed"
);

/** Forgot password */
export const forgotPassword = createAppThunk(
  "auth/forgotPassword",
  async (email, { signal }) => {
    const response = await authService.forgotPassword(email, { signal });
    return response.data;
  },
  "Password reset request failed"
);

/** Reset password */
export const resetPassword = createAppThunk(
  "auth/resetPassword",
  async (resetData, { signal }) => {
    const response = await authService.resetPassword(resetData, { signal });
    return response.data;
  },
  "Password reset failed"
);

/** Verify 2FA code */
export const verify2fa = createAppThunk(
  "auth/verify2fa",
  async (data, { signal }) => {
    const response = await authService.verify2fa(data, { signal });
    return response.data;
  },
  "2FA verification failed"
);

/** Resend 2FA code */
export const resend2fa = createAppThunk(
  "auth/resend2fa",
  async (data, { signal }) => {
    const response = await authService.resend2fa(data, { signal });
    return response.data;
  },
  "Failed to resend verification code"
);