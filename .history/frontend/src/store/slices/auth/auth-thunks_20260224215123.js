import { authService } from "@/services/domain/auth-service";
import { tokenManager } from "@/services/auth/token-manager";
import { refreshQueue } from "@/services/api/refresh-queue";
import { createAppThunk } from "@/store/utils/thunk-utils";
import {
  logout,
} from "./auth-slice";

// ==================== PRIMARY THUNKS ====================
// Login thunk
export const loginUser = createAppThunk(
  "auth/login",
  async (credentials, { signal }) => {
    const response = await authService.login(credentials, { signal });
    // tokens are set via Set-Cookie header automatically
    return response.data;
  },
  "Login failed"
);

// Register thunk
export const registerUser = createAppThunk(
  "auth/register",
  async (userData, { signal }) => {
    const response = await authService.register(userData, { signal });
    // tokens are set via Set-Cookie header automatically
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

// ==================== LATER ENHANCEMENT THUNKS ====================
// Verify email thunk
export const verifyEmail = createAppThunk(
  "auth/verifyEmail",
  async (verificationData, { signal }) => {
    const response = await authService.verifyEmail(verificationData, { signal });
    // tokens are set via Set-Cookie header automatically
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