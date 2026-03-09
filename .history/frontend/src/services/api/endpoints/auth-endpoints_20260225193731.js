// frontend/src/services/api/endpoints/auth-endpoints.js

// Authentication API endpoints configuration
// Centralized endpoint management for maintainability and type safety

class AuthEndpoints {
  constructor() {
    // Paths relative to axios base URL (already includes /api/v1)
    this.BASE = "/api";
    this.VERSION = `/v${process.env.NEXT_PUBLIC_API_VERSION || '1'}`;
    this.PREFIX = "/auth";
  }

  // ==================== ✅ IMPLEMENTED BACKEND ENDPOINTS ====================

  // Core authentication (ACTUALLY IMPLEMENTED IN BACKEND)
  get LOGIN() {
    return `${this.PREFIX}/login`;
  }

  get LOGOUT() {
    return `${this.PREFIX}/logout`;
  }

  get REGISTER() {
    return `${this.PREFIX}/register`;
  }

  get REFRESH_TOKEN() {
    return `${this.PREFIX}/refresh`;
  }

  get VERIFY_EMAIL() {
    return `${this.PREFIX}/verify-email`;
  }

  get FORGOT_PASSWORD() {
    return `${this.PREFIX}/forgot-password`;
  }

  get RESET_PASSWORD() {
    return `${this.PREFIX}/reset-password`;
  }
}

// Singleton instance
export const authEndpoints = new AuthEndpoints();
export default authEndpoints;