// frontend/src/services/domain/user-service.js
import { privateClient } from "@/services/api/client";
import { userEndpoints } from "@/services/api/endpoints";
import { normalizeError, normalizeResponse } from "@/lib/utils/error-utils";

/**
 * User Service
 * Pure data-access layer for user profile, preferences, and account management.
 *
 * Design rules:
 *   - NO console.log/error (callers decide how to handle errors)
 *   - NO Redux dispatches (callers own state updates)
 *   - NO mixed concerns (config separated from business data)
 *   - Returns normalized responses; throws normalized errors
 */
class UserService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get user profile with caching support
   */
  async getProfile(options = {}) {
    const { forceRefresh = false, useCache = true, ...requestConfig } = options;
    const cacheKey = "user_profile";

    // Check cache first if not forcing refresh
    if (useCache && !forceRefresh && this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const response = await privateClient.get(userEndpoints.PROFILE, requestConfig);
    const result = normalizeResponse(response);

    // Cache the successful response
    if (useCache) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData, config = {}) {
    const response = await privateClient.securedPatch(
      userEndpoints.ME,
      profileData,
      config
    );
    const result = normalizeResponse(response);

    // Invalidate profile cache
    this.invalidateCache("user_profile");

    return result;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file, onProgress = null, config = {}) {
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file provided");
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await privateClient.upload(
      userEndpoints.UPLOAD_AVATAR,
      formData,
      onProgress,
      config
    );
    const result = normalizeResponse(response);

    // Invalidate profile cache
    this.invalidateCache("user_profile");

    return result;
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(config = {}) {
    const response = await privateClient.delete(userEndpoints.DELETE_AVATAR, config);
    const result = normalizeResponse(response);

    this.invalidateCache("user_profile");

    return result;
  }

  // ==================== PREFERENCES & SETTINGS ====================

  /**
   * Get user preferences
   */
  async getPreferences(config = {}) {
    const response = await privateClient.get(userEndpoints.PREFERENCES, config);
    return normalizeResponse(response);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences, config = {}) {
    const formattedData = this.formatUserData(preferences);
    const response = await privateClient.patch(
      userEndpoints.UPDATE_PREFERENCES,
      formattedData,
      config
    );
    return normalizeResponse(response);
  }

  /**
   * Update theme preference
   */
  async updateTheme(theme, config = {}) {
    return this.updatePreferences({ theme }, config);
  }

  /**
   * Update language preference
   */
  async updateLanguage(language, config = {}) {
    return this.updatePreferences({ language }, config);
  }

  /**
   * Update notification preferences
   */
  async updateNotificationSettings(settings, config = {}) {
    return this.updatePreferences({ notifications: settings }, config);
  }

  // ==================== SECURITY & ACCOUNT MANAGEMENT ====================

  /**
   * Change user password
   */
  async changePassword(passwordData, config = {}) {
    this.validateUserData(passwordData, "changePassword");

    const response = await privateClient.post(
      userEndpoints.CHANGE_PASSWORD,
      passwordData,
      config
    );
    return normalizeResponse(response);
  }

  async toggle2fa(data, config = {}) {
    this.validateUserData(data, "toggle2fa");

    const response = await privateClient.patch(
      userEndpoints.TOGGLE_2FA,
      data,
      config
    );
    return normalizeResponse(response);
  }

  /**
   * Update email address
   */
  async requestEmailChange(data, config = {}) {
    const response = await privateClient.post(
      userEndpoints.EMAIL_CHANGE_REQUEST,
      data,
      config
    );
    return normalizeResponse(response);
  }

  /**
   * Delete user account
   */
  async deleteAccount(confirmationData, config = {}) {
    const response = await privateClient.post(
      userEndpoints.DELETE_ACCOUNT,
      confirmationData,
      config
    );
    return normalizeResponse(response);
  }

  // ==================== SECURITY LOGS (USER-SPECIFIC) ====================

  /**
   * Get user's security logs
   */
  async getSecurityLogs(filters = {}, page = 1, limit = 20) {
    let url = userEndpoints.SECURITY_LOGS;
    url = userEndpoints.withFilters(url, filters);
    url = userEndpoints.withPagination(url, page, limit);

    const response = await privateClient.get(url, filters.config || {});
    return normalizeResponse(response);
  }

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Set cache with timestamp
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get data from cache if valid
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(key)) {
      return cached.data;
    }
    return null;
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidateCache(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  // ==================== VALIDATION & UTILITY METHODS ====================

  /**
   * Validate user data before sending to API
   */
  validateUserData(userData, operation) {
    const validations = {
      updateProfile: ["name", "email"],
      changePassword: ["oldPassword", "newPassword"],
      updateEmail: ["newEmail", "password"],
      toggle2fa: ["enable", "currentPassword"],
    };

    const requiredFields = validations[operation] || [];
    const missingFields = requiredFields.filter(
      (field) => userData[field] === undefined || userData[field] === null
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    return true;
  }

  /**
   * Format user data for API (remove undefined/null values)
   */
  formatUserData(userData) {
    return Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value != null)
    );
  }

  /**
   * Health check for user service
   */
  async healthCheck() {
    const response = await privateClient.get("/users/health");
    return normalizeResponse(response);
  }
}

// Singleton instance
export const userService = new UserService();
export default userService;
