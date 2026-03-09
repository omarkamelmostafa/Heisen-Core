import { authService } from "@/services/domain/auth-service";
import { refreshQueue } from "@/services/api/refresh-queue";
import { createAppThunk } from "@/store/utils/thunk-utils";
import {
  startLoading,
  loginSuccess,
  setError,
  logout,
  setTokens,
  startVerification,
  endVerification,
} from "./auth-slice";

// Token persistence is now handled by the browser via HttpOnly cookies.
// No manual persistence to cookieService required here anymore.

// ==================== PRIMARY THUNKS ====================
// Login thunk
export const loginUser = createAppThunk(
  "auth/login",
  async (credentials, { signal }) => {
    const response = await authService.login(credentials, { signal });
    return response.data;
  },
  "Login failed"
);

// Register thunk
export const registerUser = createAppThunk(
  "auth/register",
  async (userData, { signal }) => {
    const response = await authService.register(userData, { signal });
    return response.data;
  },
  "Registration failed"
);

// Logout thunk
export const logoutUser = createAppThunk(
  "auth/logout",
  async (_, { dispatch, signal }) => {
    try {
      // Clear pending refresh requests before logout
      refreshQueue.clearQueue();

      await authService.logout({ signal });
      dispatch(logout()); // We still dispatch logout as it's a sync reducer clearing state
      cookieService.clearAuthData();
      return true;
    } catch (error) {
      // Even if API call fails, clear local state and cookies
      refreshQueue.clearQueue();
      dispatch(logout());
      cookieService.clearAuthData();
      throw error; // Rethrow so createAppThunk handles it, or return normalized
    }
  },
  "Logout failed"
);

// ==================== LATER ENHANCEMENT THUNKS ====================
// Verify email thunk
export const verifyEmail = createAppThunk(
  "auth/verifyEmail",
  async (verificationData, { signal }) => {
    const response = await authService.verifyEmail(verificationData, { signal });
    return response.data;
  },
  "Email verification failed"
);

// Forgot password thunk
export const forgotPassword = createAppThunk(
  "auth/forgotPassword",
  async (email, { signal }) => {
    const response = await authService.forgotPassword(email, { signal });
    return response.data;
  },
  "Password reset request failed"
);

// Reset password thunk
export const resetPassword = createAppThunk(
  "auth/resetPassword",
  async (resetData, { signal }) => {
    const response = await authService.resetPassword(resetData, { signal });
    return response.data;
  },
  "Password reset failed"
);