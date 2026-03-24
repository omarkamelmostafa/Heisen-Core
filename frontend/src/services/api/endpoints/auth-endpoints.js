// frontend/src/services/api/endpoints/auth-endpoints.js

// Authentication API endpoints configuration
// Centralized endpoint management for maintainability and type safety

class AuthEndpoints {
  constructor() {
    // Paths relative to axios base URL (already includes /api/v1)
    this.BASE = "/api";
    this.VERSION = `/v${process.env.NEXT_PUBLIC_API_VERSION || "1"}`;
    this.PREFIX = "/auth";
  }

  // ==================== CORE AUTH ENDPOINTS ====================

  get LOGIN() {
    return `${this.PREFIX}/login`;
  }

  get LOGOUT() {
    return `${this.PREFIX}/logout`;
  }

  get LOGOUT_ALL() {
    return `${this.PREFIX}/logout-all`;
  }

  get REGISTER() {
    return `${this.PREFIX}/register`;
  }

  get REFRESH_TOKEN() {
    return `${this.PREFIX}/refresh`;
  }

  // ==================== VERIFICATION ENDPOINTS ====================

  get VERIFY_EMAIL() {
    return `${this.PREFIX}/verify-email`;
  }

  get RESEND_VERIFICATION() {
    return `${this.PREFIX}/resend-verification`;
  }

  // ==================== PASSWORD ENDPOINTS ====================

  get FORGOT_PASSWORD() {
    return `${this.PREFIX}/forgot-password`;
  }

  get RESET_PASSWORD() {
    return `${this.PREFIX}/reset-password`;
  }

  get VERIFY_2FA() {
    return `${this.PREFIX}/verify-2fa`;
  }
}

// Singleton instance
export const authEndpoints = new AuthEndpoints();
export default authEndpoints;