// frontend/src/services/domain/user-service.js
import { privateClient } from "@/services/api/client";
import { userEndpoints } from "@/services/api/endpoints";
import { normalizeResponse } from "@/lib/utils/error-utils";
import { translateApiError } from "@/lib/i18n/api-error-translator";

/**
 * User Service
 * Pure data-access layer for user profile and account management.
 *
 * Design rules:
 *   - NO console.log/error (callers decide how to handle errors)
 *   - NO Redux dispatches (callers own state updates)
 *   - NO mixed concerns (config separated from business data)
 *   - Returns normalized responses; throws normalized errors
 */
class UserService {
  constructor() {
    // Service initialization - no cache or persistent state
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get user profile
   */
  async getProfile(config = {}) {
    const response = await privateClient.get(userEndpoints.PROFILE, config);
    return normalizeResponse(response);
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
    return normalizeResponse(response);
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file, onProgress = null, config = {}) {
    if (!file || !(file instanceof File)) {
      throw new Error(translateApiError("INVALID_FILE", "Invalid file provided"));
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await privateClient.upload(
      userEndpoints.UPLOAD_AVATAR,
      formData,
      onProgress,
      config
    );
    return normalizeResponse(response);
  }

  // ==================== SECURITY & ACCOUNT MANAGEMENT ====================

  /**
   * Change user password
   */
  async changePassword(passwordData, config = {}) {
    const response = await privateClient.post(
      userEndpoints.CHANGE_PASSWORD,
      passwordData,
      config
    );
    return normalizeResponse(response);
  }

  async toggle2fa(data, config = {}) {
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
}

// Singleton instance
export const userService = new UserService();
export default userService;
