// frontend/src/services/domain/auth-service.js

import { authEndpoints } from "@/services/api/endpoints";
import { publicClient, privateClient } from "@/services/api/client";
import { normalizeError, normalizeResponse } from "@/lib/utils/error-utils";
import StoreAccessor from "@/store/store-accessor";
import { setAccessToken } from "@/store/slices/auth/auth-slice";

/**
 * Auth Service
 * Pure data-access layer for authentication operations.
 * All methods are backed by real backend endpoints.
 *
 * Note on token flow:
 *   - Refresh token: HttpOnly cookie, sent automatically via withCredentials
 *   - Access token: Returned in response body, stored in Redux memory only
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
      const response = await publicClient.post(
        authEndpoints.REGISTER,
        userData,
        config
      );
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

  /**
   * Logout from all devices — requires authenticated user.
   * Backend increments tokenVersion and revokes all RefreshTokens.
   */
  async logoutAll(config = {}) {
    try {
      const response = await privateClient.post(
        authEndpoints.LOGOUT_ALL,
        {},
        config
      );
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Logout from all devices failed");
    }
  }

  /**
   * Refresh token — called by refresh-queue and bootstrap flow.
   * The backend returns a new access token in the response body
   * and sets a rotated refresh token via Set-Cookie.
   *
   * This method also stores the new access token in Redux state,
   * so subsequent requests from private-client can inject it.
   */
  async refreshToken(config = {}) {
    try {
      const response = await publicClient.post(
        authEndpoints.REFRESH_TOKEN,
        {},
        config
      );
      const normalized = normalizeResponse(response);

      // Store the new access token in Redux memory
      const accessToken = normalized.data?.data?.accessToken;
      if (accessToken) {
        try {
          StoreAccessor.dispatch(setAccessToken(accessToken));
        } catch {
          // Store not yet initialized — bootstrapAuth handles this
        }
      }

      return normalized;
    } catch (error) {
      throw normalizeError(error, "Token refresh failed");
    }
  }

  // ==================== EMAIL & PASSWORD MANAGEMENT ====================

  async forgotPassword(email, config = {}) {
    try {
      const response = await publicClient.post(
        authEndpoints.FORGOT_PASSWORD,
        { email },
        config
      );
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

  async verify2fa(data, config = {}) {
    const response = await publicClient.post(
      authEndpoints.VERIFY_2FA,
      data,
      config
    );
    return normalizeResponse(response);
  }

  async resend2fa(data, config = {}) {
    const response = await publicClient.post(
      authEndpoints.RESEND_2FA,
      data,
      config
    );
    return normalizeResponse(response);
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

  /**
   * Resend verification email for unverified accounts.
   */
  async resendVerification(email, config = {}) {
    try {
      const response = await publicClient.post(
        authEndpoints.RESEND_VERIFICATION,
        { email },
        config
      );
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Resend verification failed");
    }
  }
}

export const authService = new AuthService();
export default authService;