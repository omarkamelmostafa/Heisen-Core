// frontend/src/deepseek/user-service.js
import { privateClient } from "@/services/api/client";
import { userEndpoints } from "@/services/api/endpoints"; // ✅ FIXED IMPORT
import { store } from "@/store";
import { showNotification } from "@/store/slices/ui/ui-slice";

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
      const response = await privateClient.put(
        userEndpoints.UPDATE_PROFILE,
        profileData
      );
      return this.normalizeResponse(response);

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
        formattedData
      );
      const normalizedResponse = this.normalizeResponse(response);

      // Invalidate profile cache
      this.invalidateCache("user_profile");

      // Show success notification
      store.dispatch(
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
        onProgress
      );
      const normalizedResponse = this.normalizeResponse(response);

      // Invalidate profile cache
      this.invalidateCache("user_profile");

      store.dispatch(
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
  async deleteAvatar() {
    try {
      const response = await privateClient.delete(userEndpoints.DELETE_AVATAR);
      const normalizedResponse = this.normalizeResponse(response);

      this.invalidateCache("user_profile");

      store.dispatch(
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
  async getPreferences() {
    try {
      const response = await privateClient.get(userEndpoints.PREFERENCES);
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
        formattedData
      );
      const normalizedResponse = this.normalizeResponse(response);

      store.dispatch(
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
        passwordData
      );
      const normalizedResponse = this.normalizeResponse(response);

      store.dispatch(
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
        emailData
      );
      const normalizedResponse = this.normalizeResponse(response);

      store.dispatch(
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
        confirmationData
      );
      const normalizedResponse = this.normalizeResponse(response);

      store.dispatch(
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

      const response = await privateClient.get(url);
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

  // ==================== RESPONSE & ERROR HANDLING ====================

  /**
   * Normalize API responses for consistent handling
   */
  normalizeResponse(response) {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
      timestamp: Date.now(),
    };
  }

  /**
   * Normalize errors for consistent handling
   */
  normalizeError(error, defaultMessage) {
    if (error.isNormalized) return error;

    return {
      message: error.response?.data?.message || error.message || defaultMessage,
      code: error.code,
      status: error.response?.status,
      details: error.response?.data?.details,
      isNormalized: true,
      originalError: error,
    };
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
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.normalizeError(error, "User service health check failed");
    }
  }
}

// Singleton instance
export const userService = new UserService();
export default userService;

// import { securedClient } from "@/services/api/client";
// import { user } from "@/services/api/endpoints";
// import { store } from "@/store";
// import { showNotification } from "@/store/slices/ui/ui-slice";

// /**
//  * Enterprise User Service
//  * Handles all user-related operations including profile management,
//  * preferences, security settings, and administrative functions.
//  */
// class UserService {
//   constructor() {
//     this.cache = new Map();
//     this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
//   }

//   // ==================== PROFILE MANAGEMENT ====================

//   /**
//    * Get user profile with caching support
//    */
//   async getProfile(options = {}) {
//     const { forceRefresh = false, useCache = true } = options;
//     const cacheKey = "user_profile";

//     // Check cache first if not forcing refresh
//     if (useCache && !forceRefresh && this.isCacheValid(cacheKey)) {
//       return this.getFromCache(cacheKey);
//     }

//     try {
//       const response = await securedClient.get(userEndpoints.PROFILE);

//       // Cache the successful response
//       if (useCache) {
//         this.setCache(cacheKey, response);
//       }

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to fetch profile", error);
//       throw this.normalizeError(error, "Failed to load profile");
//     }
//   }

//   /**
//    * Update user profile
//    */
//   async updateProfile(profileData) {
//     try {
//       const response = await securedClient.put(
//         userEndpoints.UPDATE_PROFILE,
//         profileData
//       );

//       // Invalidate profile cache
//       this.invalidateCache("user_profile");

//       // Show success notification
//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "Profile Updated",
//           message: "Your profile has been updated successfully",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to update profile", error);
//       throw this.normalizeError(error, "Failed to update profile");
//     }
//   }

//   /**
//    * Upload user avatar
//    */
//   async uploadAvatar(file, onProgress = null) {
//     const formData = new FormData();
//     formData.append("avatar", file);

//     try {
//       const response = await securedClient.upload(
//         userEndpoints.UPLOAD_AVATAR,
//         formData,
//         onProgress
//       );

//       // Invalidate profile cache
//       this.invalidateCache("user_profile");

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "Avatar Updated",
//           message: "Your profile picture has been updated",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to upload avatar", error);
//       throw this.normalizeError(error, "Failed to upload profile picture");
//     }
//   }

//   /**
//    * Delete user avatar
//    */
//   async deleteAvatar() {
//     try {
//       const response = await securedClient.delete(userEndpoints.UPLOAD_AVATAR);

//       this.invalidateCache("user_profile");

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "Avatar Removed",
//           message: "Your profile picture has been removed",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to delete avatar", error);
//       throw this.normalizeError(error, "Failed to remove profile picture");
//     }
//   }

//   // ==================== PREFERENCES & SETTINGS ====================

//   /**
//    * Get user preferences
//    */
//   async getPreferences() {
//     try {
//       const response = await securedClient.get(userEndpoints.PREFERENCES);
//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to fetch preferences", error);
//       throw this.normalizeError(error, "Failed to load preferences");
//     }
//   }

//   /**
//    * Update user preferences
//    */
//   async updatePreferences(preferences) {
//     try {
//       const response = await securedClient.patch(
//         userEndpoints.PREFERENCES,
//         preferences
//       );

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "Preferences Updated",
//           message: "Your preferences have been saved",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to update preferences", error);
//       throw this.normalizeError(error, "Failed to update preferences");
//     }
//   }

//   /**
//    * Update theme preference
//    */
//   async updateTheme(theme) {
//     return this.updatePreferences({ theme });
//   }

//   /**
//    * Update language preference
//    */
//   async updateLanguage(language) {
//     return this.updatePreferences({ language });
//   }

//   /**
//    * Update notification preferences
//    */
//   async updateNotificationSettings(settings) {
//     return this.updatePreferences({ notifications: settings });
//   }

//   // ==================== SECURITY & ACCOUNT MANAGEMENT ====================

//   /**
//    * Change user password
//    */
//   async changePassword(passwordData) {
//     try {
//       const response = await securedClient.post(
//         userEndpoints.CHANGE_PASSWORD,
//         passwordData
//       );

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "Password Changed",
//           message: "Your password has been updated successfully",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to change password", error);
//       throw this.normalizeError(error, "Failed to change password");
//     }
//   }

//   /**
//    * Update email address
//    */
//   async updateEmail(emailData) {
//     try {
//       const response = await securedClient.post(
//         userEndpoints.UPDATE_EMAIL,
//         emailData
//       );

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "Email Update Requested",
//           message: "Please check your email to confirm the new address",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to update email", error);
//       throw this.normalizeError(error, "Failed to update email address");
//     }
//   }

//   /**
//    * Delete user account
//    */
//   async deleteAccount(confirmationData) {
//     try {
//       const response = await securedClient.post(
//         userEndpoints.DELETE_ACCOUNT,
//         confirmationData
//       );

//       store.dispatch(
//         showNotification({
//           type: "info",
//           title: "Account Deleted",
//           message: "Your account has been permanently deleted",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to delete account", error);
//       throw this.normalizeError(error, "Failed to delete account");
//     }
//   }

//   // ==================== SESSION & SECURITY MANAGEMENT ====================

//   /**
//    * Get active sessions
//    */
//   async getSessions(page = 1, limit = 10) {
//     try {
//       const url = userEndpoints.withPagination(
//         userEndpoints.SESSIONS,
//         page,
//         limit
//       );
//       return await securedClient.get(url);
//     } catch (error) {
//       console.error("UserService: Failed to fetch sessions", error);
//       throw this.normalizeError(error, "Failed to load sessions");
//     }
//   }

//   /**
//    * Revoke specific session
//    */
//   async revokeSession(sessionId) {
//     try {
//       const response = await securedClient.delete(
//         userEndpoints.SESSION(sessionId)
//       );

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "Session Revoked",
//           message: "The session has been terminated",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to revoke session", error);
//       throw this.normalizeError(error, "Failed to revoke session");
//     }
//   }

//   /**
//    * Revoke all sessions except current
//    */
//   async revokeAllOtherSessions() {
//     try {
//       const response = await securedClient.delete(userEndpoints.SESSIONS);

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "Sessions Revoked",
//           message: "All other sessions have been terminated",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to revoke sessions", error);
//       throw this.normalizeError(error, "Failed to revoke sessions");
//     }
//   }

//   /**
//    * Get security logs
//    */
//   async getSecurityLogs(filters = {}, page = 1, limit = 20) {
//     try {
//       let url = userEndpoints.SECURITY_LOGS;
//       url = userEndpoints.withFilters(url, filters);
//       url = userEndpoints.withPagination(url, page, limit);

//       return await securedClient.get(url);
//     } catch (error) {
//       console.error("UserService: Failed to fetch security logs", error);
//       throw this.normalizeError(error, "Failed to load security logs");
//     }
//   }

//   // ==================== ADMINISTRATIVE FUNCTIONS ====================

//   /**
//    * Get all users (admin only)
//    */
//   async getAllUsers(filters = {}, page = 1, limit = 50) {
//     try {
//       let url = userEndpoints.ADMIN_USERS;
//       url = userEndpoints.withFilters(url, filters);
//       url = userEndpoints.withPagination(url, page, limit);

//       return await securedClient.get(url);
//     } catch (error) {
//       console.error("UserService: Failed to fetch users", error);
//       throw this.normalizeError(error, "Failed to load users");
//     }
//   }

//   /**
//    * Get user by ID (admin only)
//    */
//   async getUserById(userId) {
//     try {
//       return await securedClient.get(userEndpoints.ADMIN_USER(userId));
//     } catch (error) {
//       console.error("UserService: Failed to fetch user", error);
//       throw this.normalizeError(error, "Failed to load user details");
//     }
//   }

//   /**
//    * Update user (admin only)
//    */
//   async updateUser(userId, userData) {
//     try {
//       const response = await securedClient.put(
//         userEndpoints.ADMIN_USER(userId),
//         userData
//       );

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "User Updated",
//           message: "User information has been updated",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to update user", error);
//       throw this.normalizeError(error, "Failed to update user");
//     }
//   }

//   /**
//    * Suspend user account (admin only)
//    */
//   async suspendUser(userId, reason) {
//     try {
//       const response = await securedClient.post(
//         userEndpoints.ADMIN_USER_SUSPEND(userId),
//         { reason }
//       );

//       store.dispatch(
//         showNotification({
//           type: "warning",
//           title: "User Suspended",
//           message: "User account has been suspended",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to suspend user", error);
//       throw this.normalizeError(error, "Failed to suspend user");
//     }
//   }

//   /**
//    * Reactivate user account (admin only)
//    */
//   async reactivateUser(userId) {
//     try {
//       const response = await securedClient.delete(
//         userEndpoints.ADMIN_USER_SUSPEND(userId)
//       );

//       store.dispatch(
//         showNotification({
//           type: "success",
//           title: "User Reactivated",
//           message: "User account has been reactivated",
//         })
//       );

//       return response;
//     } catch (error) {
//       console.error("UserService: Failed to reactivate user", error);
//       throw this.normalizeError(error, "Failed to reactivate user");
//     }
//   }

//   // ==================== CACHE MANAGEMENT ====================

//   /**
//    * Set cache with timestamp
//    */
//   setCache(key, data) {
//     this.cache.set(key, {
//       data,
//       timestamp: Date.now(),
//     });
//   }

//   /**
//    * Get data from cache if valid
//    */
//   getFromCache(key) {
//     const cached = this.cache.get(key);
//     if (cached && this.isCacheValid(key)) {
//       return cached.data;
//     }
//     return null;
//   }

//   /**
//    * Check if cache is still valid
//    */
//   isCacheValid(key) {
//     const cached = this.cache.get(key);
//     if (!cached) return false;

//     return Date.now() - cached.timestamp < this.cacheTimeout;
//   }

//   /**
//    * Invalidate specific cache entry
//    */
//   invalidateCache(key) {
//     this.cache.delete(key);
//   }

//   /**
//    * Clear all cache
//    */
//   clearCache() {
//     this.cache.clear();
//   }

//   // ==================== ERROR HANDLING ====================

//   /**
//    * Normalize errors for consistent handling
//    */
//   normalizeError(error, defaultMessage) {
//     if (error.isNormalized) return error;

//     return {
//       message:
//         error.message || defaultMessage || "An unexpected error occurred",
//       code: error.code,
//       status: error.status,
//       details: error.details,
//       isNormalized: true,
//       originalError: error,
//     };
//   }

//   // ==================== UTILITY METHODS ====================

//   /**
//    * Validate user data before sending to API
//    */
//   validateUserData(userData, operation) {
//     const validations = {
//       updateProfile: ["name", "email"],
//       changePassword: ["currentPassword", "newPassword"],
//       updateEmail: ["newEmail", "password"],
//     };

//     const requiredFields = validations[operation] || [];
//     const missingFields = requiredFields.filter((field) => !userData[field]);

//     if (missingFields.length > 0) {
//       throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
//     }

//     return true;
//   }

//   /**
//    * Format user data for API
//    */
//   formatUserData(userData) {
//     // Remove any undefined or null values
//     return Object.fromEntries(
//       Object.entries(userData).filter(([_, value]) => value != null)
//     );
//   }
// }

// // Singleton instance
// export const userService = new UserService();

// Default export for convenience
// export default userService;
