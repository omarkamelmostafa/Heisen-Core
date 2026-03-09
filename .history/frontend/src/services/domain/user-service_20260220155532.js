// frontend/src/services/domain/user-service.js
import { privateClient } from "@/services/api/client";
import { userEndpoints } from "@/services/api/endpoints"; // ✅ FIXED IMPORT
import StoreAccessor from "@/store/store-accessor";
import { showNotification } from "@/store/slices/ui/ui-slice";
import { normalizeError, normalizeResponse } from "@/lib/utils/error-utils";

/**
 * Enterprise User Service
 * Handles user profile management, preferences, and personal settings.
 * NOTE: Session management moved to AuthService, Admin functions moved to AdminService
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
    const { forceRefresh = false, useCache = true } = options;
    const cacheKey = "user_profile";

    // Check cache first if not forcing refresh
    if (useCache && !forceRefresh && this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      const response = await privateClient.get(userEndpoints.PROFILE, options);
      const normalizedResponse = this.normalizeResponse(response);

      // Cache the successful response
      if (useCache) {
        this.setCache(cacheKey, normalizedResponse);
      }

      return normalizedResponse;
    } catch (error) {
      console.error("UserService: Failed to fetch profile", error);
      throw this.normalizeError(error, "Failed to load profile");
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      // Validate input
      this.validateUserData(profileData, "updateProfile");

      const formattedData = this.formatUserData(profileData);
      const response = await privateClient.put(
        userEndpoints.UPDATE_PROFILE,
        formattedData,
        profileData.config || {}
      );
      const normalizedResponse = this.normalizeResponse(response);

      // Invalidate profile cache
      this.invalidateCache("user_profile");

      // Show success notification
      StoreAccessor.dispatch(
        showNotification({
          type: "success",
          title: "Profile Updated",
          message: "Your profile has been updated successfully",
        })
      );

      return normalizedResponse;
    } catch (error) {
      console.error("UserService: Failed to update profile", error);
      throw this.normalizeError(error, "Failed to update profile");
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file, onProgress = null) {
    try {
      // Validate file
      if (!file || !(file instanceof File)) {
        throw new Error("Invalid file provided");
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await privateClient.upload(
        userEndpoints.UPLOAD_AVATAR,
        formData,
        onProgress,
        file.config || {}
      );
      const normalizedResponse = this.normalizeResponse(response);

      // Invalidate profile cache
      this.invalidateCache("user_profile");

      StoreAccessor.dispatch(
        showNotification({
          type: "success",
          title: "Avatar Updated",
          message: "Your profile picture has been updated",
        })
      );

      return normalizedResponse;
    } catch (error) {
      console.error("UserService: Failed to upload avatar", error);
      throw this.normalizeError(error, "Failed to upload profile picture");
    }
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(config = {}) {
    try {
      const response = await privateClient.delete(userEndpoints.DELETE_AVATAR, config);
      const normalizedResponse = this.normalizeResponse(response);

      this.invalidateCache("user_profile");

      StoreAccessor.dispatch(
        showNotification({
          type: "success",
          title: "Avatar Removed",
          message: "Your profile picture has been removed",
        })
      );

      return normalizedResponse;
    } catch (error) {
      console.error("UserService: Failed to delete avatar", error);
      throw this.normalizeError(error, "Failed to remove profile picture");
    }
  }

  // ==================== PREFERENCES & SETTINGS ====================

  /**
   * Get user preferences
   */
  async getPreferences(config = {}) {
    try {
      const response = await privateClient.get(userEndpoints.PREFERENCES, config);
      return this.normalizeResponse(response);
    } catch (error) {
      console.error("UserService: Failed to fetch preferences", error);
      throw this.normalizeError(error, "Failed to load preferences");
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    try {
      const formattedData = this.formatUserData(preferences);
      const response = await privateClient.patch(
        userEndpoints.UPDATE_PREFERENCES,
        formattedData,
        preferences.config || {}
      );
      const normalizedResponse = this.normalizeResponse(response);

      StoreAccessor.dispatch(
        showNotification({
          type: "success",
          title: "Preferences Updated",
          message: "Your preferences have been saved",
        })
      );

      return normalizedResponse;
    } catch (error) {
      console.error("UserService: Failed to update preferences", error);
      throw this.normalizeError(error, "Failed to update preferences");
    }
  }

  /**
   * Update theme preference
   */
  async updateTheme(theme) {
    try {
      return await this.updatePreferences({ theme });
    } catch (error) {
      throw this.normalizeError(error, "Failed to update theme");
    }
  }

  /**
   * Update language preference
   */
  async updateLanguage(language) {
    try {
      return await this.updatePreferences({ language });
    } catch (error) {
      throw this.normalizeError(error, "Failed to update language");
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationSettings(settings) {
    try {
      return await this.updatePreferences({ notifications: settings });
    } catch (error) {
      throw this.normalizeError(
        error,
        "Failed to update notification settings"
      );
    }
  }

  // ==================== SECURITY & ACCOUNT MANAGEMENT ====================

  /**
   * Change user password
   */
  async changePassword(passwordData) {
    try {
      this.validateUserData(passwordData, "changePassword");

      const response = await privateClient.post(
        userEndpoints.CHANGE_PASSWORD,
        passwordData,
        passwordData.config || {}
      );
      const normalizedResponse = this.normalizeResponse(response);

      StoreAccessor.dispatch(
        showNotification({
          type: "success",
          title: "Password Changed",
          message: "Your password has been updated successfully",
        })
      );

      return normalizedResponse;
    } catch (error) {
      console.error("UserService: Failed to change password", error);
      throw this.normalizeError(error, "Failed to change password");
    }
  }

  /**
   * Update email address
   */
  async updateEmail(emailData) {
    try {
      this.validateUserData(emailData, "updateEmail");

      const response = await privateClient.post(
        userEndpoints.UPDATE_EMAIL,
        emailData,
        emailData.config || {}
      );
      const normalizedResponse = this.normalizeResponse(response);

      StoreAccessor.dispatch(
        showNotification({
          type: "success",
          title: "Email Update Requested",
          message: "Please check your email to confirm the new address",
        })
      );

      return normalizedResponse;
    } catch (error) {
      console.error("UserService: Failed to update email", error);
      throw this.normalizeError(error, "Failed to update email address");
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(confirmationData) {
    try {
      const response = await privateClient.post(
        userEndpoints.DELETE_ACCOUNT,
        confirmationData,
        confirmationData.config || {}
      );
      const normalizedResponse = this.normalizeResponse(response);

      StoreAccessor.dispatch(
        showNotification({
          type: "info",
          title: "Account Deleted",
          message: "Your account has been permanently deleted",
        })
      );

      return normalizedResponse;
    } catch (error) {
      console.error("UserService: Failed to delete account", error);
      throw this.normalizeError(error, "Failed to delete account");
    }
  }

  // ==================== SECURITY LOGS (USER-SPECIFIC) ====================

  /**
   * Get user's security logs
   */
  async getSecurityLogs(filters = {}, page = 1, limit = 20) {
    try {
      let url = userEndpoints.SECURITY_LOGS;
      url = userEndpoints.withFilters(url, filters);
      url = userEndpoints.withPagination(url, page, limit);

      const response = await privateClient.get(url, filters.config || {});
      return this.normalizeResponse(response);
    } catch (error) {
      console.error("UserService: Failed to fetch security logs", error);
      throw this.normalizeError(error, "Failed to load security logs");
    }
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
      changePassword: ["currentPassword", "newPassword"],
      updateEmail: ["newEmail", "password"],
    };

    const requiredFields = validations[operation] || [];
    const missingFields = requiredFields.filter((field) => !userData[field]);

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
    try {
      const response = await privateClient.get("/users/health");
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "User service health check failed");
    }
  }
}

// Singleton instance
export const userService = new UserService();
export default userService;


