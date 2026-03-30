// frontend/src/services/storage/token-manager.js

import { store } from "@/store";
import { refreshTokens, logoutUser } from "@/store/slices/auth/auth-thunks";
import { cookieService } from "./cookie-service";
import { TOKEN_BUFFERS } from "./storage-constants";

class TokenManager {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Add subscriber to refresh queue
  addRefreshSubscriber(callback) {
    this.refreshSubscribers.push(callback);
  }

  // Execute all subscribers with new token
  onRefreshSuccess(token) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  // Execute all subscribers with error
  onRefreshFailure(error) {
    this.refreshSubscribers.forEach((callback) => callback(null, error));
    this.refreshSubscribers = [];
  }

  // Check if token is about to expire
  isTokenExpiring() {
    const token = cookieService.getAccessToken();
    if (!token) return true;

    try {
      // Simple check - in real app, you'd decode JWT and check expiry
      // For now, we'll rely on the backend telling us when token is expired
      return false;
    } catch (error) {
      console.error("TokenManager: Error checking token expiry", error);
      return true;
    }
  }

  // Refresh token with queuing mechanism
  async refreshToken() {
    // If already refreshing, return the ongoing promise
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.addRefreshSubscriber((token, error) => {
          if (error) reject(error);
          else resolve(token);
        });
      });
    }

    this.isRefreshing = true;
    const refreshToken = cookieService.getRefreshToken();

    if (!refreshToken) {
      this.isRefreshing = false;
      throw new Error("No refresh token available");
    }

    try {
      // Dispatch Redux thunk to refresh tokens
      const result = await store.dispatch(refreshTokens(refreshToken)).unwrap();

      this.isRefreshing = false;
      this.onRefreshSuccess(result.accessToken);
      this.retryCount = 0; // Reset retry count on success

      return result.accessToken;
    } catch (error) {
      this.isRefreshing = false;
      this.onRefreshFailure(error);
      this.retryCount++;

      // If refresh fails multiple times, logout user
      if (this.retryCount >= this.maxRetries) {
        await this.handleRefreshFailure();
      }

      throw error;
    }
  }

  // Handle complete refresh failure
  async handleRefreshFailure() {
    console.error("TokenManager: Refresh failed multiple times, logging out");
    await store.dispatch(logoutUser());

    // Clear any remaining tokens
    cookieService.clearAuthData();

    // Redirect to login (you might want to use router here)
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // Reset manager state
  reset() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.retryCount = 0;
  }
}

// Singleton instance
export const tokenManager = new TokenManager();
export default tokenManager;
