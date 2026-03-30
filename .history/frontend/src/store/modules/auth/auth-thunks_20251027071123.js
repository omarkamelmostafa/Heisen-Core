// frontend/src/store/modules/auth/auth-thunks.js
import { authService } from "@/services/domain/auth-service";
import {
  setCredentials,
  clearCredentials,
  setLoading,
  setError,
  updateTokens,
  clearError,
} from "./auth-slice";

// Professional error handling utility
const handleAuthError = (error, dispatch) => {
  const message =
    error.response?.data?.message || error.message || "Authentication failed";
  dispatch(setError(message));
  throw new Error(message);
};

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(clearError());
    dispatch(setLoading(true));

    const response = await authService.login(credentials);
    const { user, accessToken, refreshToken } = response.data;

    dispatch(setCredentials({ user, accessToken, refreshToken }));

    // Store tokens securely
    authService.storeTokens({ accessToken, refreshToken });

    return response.data;
  } catch (error) {
    return handleAuthError(error, dispatch);
  } finally {
    dispatch(setLoading(false));
  }
};

export const logout = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Call logout API to invalidate tokens on server
    await authService.logout();
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local state even if API call fails
  } finally {
    // Always clear local state
    authService.clearTokens();
    dispatch(clearCredentials());
    dispatch(setLoading(false));
  }
};

export const refreshToken = () => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const currentRefreshToken = auth.refreshToken;

    if (!currentRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await authService.refreshToken(currentRefreshToken);
    const { accessToken, refreshToken } = response.data;

    dispatch(updateTokens({ accessToken, refreshToken }));
    authService.storeTokens({ accessToken, refreshToken });

    return { accessToken, refreshToken };
  } catch (error) {
    // If refresh fails, logout user
    dispatch(logout());
    throw error;
  }
};
