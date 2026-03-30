// frontend/src/services/storage/cookie-service.js
import Cookies from "js-cookie";
import { STORAGE_KEYS, COOKIE_CONFIG } from "./storage-constants";

class CookieService {
  constructor() {
    this.config = COOKIE_CONFIG;
  }

  // Set cookie with enhanced options
  set(key, value, options = {}) {
    const cookieOptions = {
      ...this.config,
      ...options,
    };

    try {
      Cookies.set(key, value, cookieOptions);
      return true;
    } catch (error) {
      console.error(`CookieService: Failed to set cookie ${key}`, error);
      return false;
    }
  }

  // Get cookie value
  get(key) {
    try {
      return Cookies.get(key);
    } catch (error) {
      console.error(`CookieService: Failed to get cookie ${key}`, error);
      return null;
    }
  }

  // Remove cookie
  remove(key, options = {}) {
    try {
      const removeOptions = {
        ...this.config,
        ...options,
      };
      Cookies.remove(key, removeOptions);
      return true;
    } catch (error) {
      console.error(`CookieService: Failed to remove cookie ${key}`, error);
      return false;
    }
  }

  // Token management methods
  getAccessToken() {
    return this.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  clearTokens() {
    this.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.remove(STORAGE_KEYS.TOKEN_EXPIRY);
    // Note: refresh token is httpOnly — cleared by the backend on logout
  }

  // Clear all auth-related cookies
  clearAuthData() {
    this.clearTokens();
    this.remove(STORAGE_KEYS.USER_DATA);
  }
}

// Singleton instance
export const cookieService = new CookieService();
export default cookieService;
