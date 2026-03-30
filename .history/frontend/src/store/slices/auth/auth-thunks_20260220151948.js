import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/domain/auth-service";
import { cookieService } from "@/services/storage/cookie-service";
import { refreshQueue } from "@/services/api/refresh-queue";
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
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      persistTokensToCookies(response.data?.tokens);
      return response.data;
    } catch (error) {
      const errorMessage = error?.message || "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Register thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      persistTokensToCookies(response.data?.tokens);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Clear pending refresh requests before logout
      refreshQueue.clearQueue();

      await authService.logout();
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
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(verificationData);
      persistTokensToCookies(response.data?.tokens);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Email verification failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Forgot password thunk
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password reset request failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(resetData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password reset failed";
      return rejectWithValue(errorMessage);
    }
  }
);