import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/domain/auth-service";
import { cookieService } from "@/services/storage/cookie-service";
import { refreshQueue } from "@/services/api/refresh-queue";
import { normalizeError } from "@/lib/utils/error-utils";
import {
  startLoading,
  loginSuccess,
  setError,
  logout,
  setTokens,
  startVerification,
  endVerification,
} from "./auth-slice";

/** Persist tokens to cookies so privateClient can attach Bearer token to requests. */
function persistTokensToCookies(tokens) {
  if (tokens?.accessToken != null && tokens?.refreshToken != null) {
    cookieService.setTokens(tokens.accessToken, tokens.refreshToken);
  }
}

// ==================== PRIMARY THUNKS ====================
// Login thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue, signal }) => {
    try {
      const response = await authService.login(credentials, { signal });
      persistTokensToCookies(response.data?.tokens);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Login failed").message);
    }
  }
);

// Register thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue, signal }) => {
    try {
      const response = await authService.register(userData, { signal });
      persistTokensToCookies(response.data?.tokens);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Registration failed").message);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue, signal }) => {
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
      return rejectWithValue("Logout failed but local session cleared");
    }
  }
);

// ==================== LATER ENHANCEMENT THUNKS ====================
// Verify email thunk
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (verificationData, { rejectWithValue, signal }) => {
    try {
      const response = await authService.verifyEmail(verificationData, { signal });
      persistTokensToCookies(response.data?.tokens);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Email verification failed").message);
    }
  }
);

// Forgot password thunk
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue, signal }) => {
    try {
      const response = await authService.forgotPassword(email, { signal });
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Password reset request failed").message);
    }
  }
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { rejectWithValue, signal }) => {
    try {
      const response = await authService.resetPassword(resetData, { signal });
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Password reset failed").message);
    }
  }
);