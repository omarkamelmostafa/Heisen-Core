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
  async (credentials, { dispatch, rejectWithValue }) => {
    try {

      console.log("loginUser", credentials);

      dispatch(startLoading());
      const response = await authService.login(credentials);
      dispatch(loginSuccess(response.data));
      persistTokensToCookies(response.data?.tokens);
      return response.data;
    } catch (error) {
      console.log("loginUser error", error);
      const errorMessage = error?.message || "Login failed";
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Register thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await authService.register(userData);
      persistTokensToCookies(response.data?.tokens);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      dispatch(setError(errorMessage));
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
      dispatch(logout());
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
  async (verificationData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      dispatch(startVerification());
      const response = await authService.verifyEmail(verificationData);
      dispatch(loginSuccess(response.data));
      persistTokensToCookies(response.data?.tokens);
      dispatch(endVerification());
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Email verification failed";
      dispatch(setError(errorMessage));
      dispatch(endVerification());
      return rejectWithValue(errorMessage);
    }
  }
);

// Forgot password thunk
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password reset request failed";
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading());
      const response = await authService.resetPassword(resetData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password reset failed";
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);