// frontend/src/services/domain/auth-service.js

import { authEndpoints } from "@/services/api/endpoints";
import { publicClient, privateClient } from "@/services/api/client";
import { normalizeError, normalizeResponse } from "@/lib/utils/error-utils";

/**
 * Auth Service
 * Pure data-access layer for authentication operations.
 * All methods are implemented and backed by real backend endpoints.
 */
class AuthService {
  // ==================== CORE AUTHENTICATION ====================

  async login(credentials, config = {}) {
    try {
      const response = await publicClient.post(
        authEndpoints.LOGIN,
        credentials,
        config
      );
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Login failed");
    }
  }

  async register(userData, config = {}) {
    try {
      const response = await publicClient.post(authEndpoints.REGISTER, userData, config);
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Registration failed");
    }
  }

  async logout(config = {}) {
    try {
      const response = await privateClient.get(authEndpoints.LOGOUT, config);
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Logout failed");
    }
  }

  async refreshToken(config = {}) {
    try {
      const response = await publicClient.post(authEndpoints.REFRESH_TOKEN, {}, config);
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Token refresh failed");
    }
  }

  // ==================== EMAIL & PASSWORD MANAGEMENT ====================

  async forgotPassword(email, config = {}) {
    try {
      const response = await publicClient.post(authEndpoints.FORGOT_PASSWORD, {
        email,
      }, config);
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Password reset request failed");
    }
  }

  async resetPassword(resetData, config = {}) {
    try {
      const response = await publicClient.post(
        authEndpoints.RESET_PASSWORD,
        resetData,
        config
      );
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Password reset failed");
    }
  }

  async verifyEmail(verificationData, config = {}) {
    try {
      const response = await publicClient.post(
        authEndpoints.VERIFY_EMAIL,
        verificationData,
        config
      );
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Email verification failed");
    }
  }
}

export const authService = new AuthService();
export default authService;