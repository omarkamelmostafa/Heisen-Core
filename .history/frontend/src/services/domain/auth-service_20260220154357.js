// frontend/src/services/domain/auth-service.js

import { authEndpoints } from "@/services/api/endpoints";
import { publicClient, privateClient } from "@/services/api/client";
import { normalizeError, normalizeResponse } from "@/lib/utils/error-utils";

class AuthService {
  // ==================== ✅ IMPLEMENTED FEATURES ====================
  // These endpoints are ACTUALLY available in your backend

  /**
   * Core Authentication - IMPLEMENTED
   */
  async login(credentials) {
    try {
      const response = await publicClient.post(
        authEndpoints.LOGIN,
        credentials
      );
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Login failed");
    }
  }

  async register(userData) {
    try {
      const response = await publicClient.post(authEndpoints.REGISTER, userData);
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Registration failed");
    }
  }

  async logout() {
    try {
      const response = await privateClient.get(authEndpoints.LOGOUT);
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Logout failed");
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await publicClient.post(authEndpoints.REFRESH_TOKEN, {
        refreshToken,
      });
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Token refresh failed");
    }
  }

  /**
   * Email & Password Management - IMPLEMENTED
   */
  async forgotPassword(email) {
    try {
      const response = await publicClient.post(authEndpoints.FORGOT_PASSWORD, {
        email,
      });
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Password reset request failed");
    }
  }

  async resetPassword(resetData) {
    try {
      const response = await publicClient.post(
        authEndpoints.RESET_PASSWORD,
        resetData
      );
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Password reset failed");
    }
  }

  async verifyEmail(verificationData) {
    try {
      const response = await publicClient.post(
        authEndpoints.VERIFY_EMAIL,
        verificationData
      );
      return normalizeResponse(response);
    } catch (error) {
      throw normalizeError(error, "Email verification failed");
    }
  }

  // ==================== 🚧 PLANNED FEATURES ====================
  // These endpoints are NOT YET IMPLEMENTED in backend
  // They're included for future reference and API contract

  /**
   * Profile Management - PLANNED
   * @todo Implement when backend endpoints are available
   */
  async getProfile() {
    console.warn('🔄 AuthService: getProfile() - Endpoint not yet implemented');
    throw new Error('Profile endpoints not yet implemented in backend');
  }

  async updateProfile(profileData) {
    console.warn('🔄 AuthService: updateProfile() - Endpoint not yet implemented');
    throw new Error('Profile endpoints not yet implemented in backend');
  }

  async changePassword(passwordData) {
    console.warn('🔄 AuthService: changePassword() - Endpoint not yet implemented');
    throw new Error('Password change endpoint not yet implemented in backend');
  }

  /**
   * Session Management - PLANNED
   * @todo Implement when backend endpoints are available
   */
  async getSessions(page = 1, limit = 10) {
    console.warn('🔄 AuthService: getSessions() - Endpoint not yet implemented');
    throw new Error('Session management endpoints not yet implemented in backend');
  }

  async revokeSession(sessionId) {
    console.warn('🔄 AuthService: revokeSession() - Endpoint not yet implemented');
    throw new Error('Session management endpoints not yet implemented in backend');
  }

  /**
   * Two-Factor Authentication - PLANNED
   * @todo Implement when backend endpoints are available
   */
  async setup2FA() {
    console.warn('🔄 AuthService: setup2FA() - Endpoint not yet implemented');
    throw new Error('2FA endpoints not yet implemented in backend');
  }

  async verify2FA(code) {
    console.warn('🔄 AuthService: verify2FA() - Endpoint not yet implemented');
    throw new Error('2FA endpoints not yet implemented in backend');
  }

  async disable2FA() {
    console.warn('🔄 AuthService: disable2FA() - Endpoint not yet implemented');
    throw new Error('2FA endpoints not yet implemented in backend');
  }

  /**
   * Social Authentication - PLANNED
   * @todo Implement when backend endpoints are available
   */
  async connectSocial(provider) {
    console.warn('🔄 AuthService: connectSocial() - Endpoint not yet implemented');
    throw new Error('Social authentication endpoints not yet implemented in backend');
  }

  async disconnectSocial(provider) {
    console.warn('🔄 AuthService: disconnectSocial() - Endpoint not yet implemented');
    throw new Error('Social authentication endpoints not yet implemented in backend');
  }

  /**
   * Security & Devices - PLANNED
   * @todo Implement when backend endpoints are available
   */
  async getDevices() {
    console.warn('🔄 AuthService: getDevices() - Endpoint not yet implemented');
    throw new Error('Device management endpoints not yet implemented in backend');
  }

  async getSecurityLogs(filters = {}, page = 1, limit = 20) {
    console.warn('🔄 AuthService: getSecurityLogs() - Endpoint not yet implemented');
    throw new Error('Security logs endpoints not yet implemented in backend');
  }



  // ==================== 🔍 SERVICE STATUS ====================

  /**
   * Check which features are currently available
   */
  getFeatureStatus() {
    return {
      implemented: {
        coreAuth: true,
        emailVerification: true,
        passwordReset: true,
        tokenRefresh: true
      },
      planned: {
        profileManagement: false,
        sessionManagement: false,
        twoFactorAuth: false,
        socialAuth: false,
        deviceManagement: false,
        securityLogs: false
      }
    };
  }

  /**
   * Health check for auth service
   */
  async healthCheck() {
    try {
      // Simple health check using an implemented endpoint
      const response = await publicClient.get(authEndpoints.LOGIN, {
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });

      return {
        status: 'healthy',
        timestamp: Date.now(),
        implementedEndpoints: Object.keys(this.getFeatureStatus().implemented)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}

export const authService = new AuthService();
export default authService;