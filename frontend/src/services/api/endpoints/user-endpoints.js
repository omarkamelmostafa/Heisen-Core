// frontend/src/services/api/endpoints/user-endpoints.js

// User Management API endpoints configuration
// Centralized endpoint management for maintainability and type safety

class UserEndpoints {
  constructor() {
    // Paths relative to axios base URL (already includes /api/v1)
    this.BASE = "/api";
    this.VERSION = `/v${process.env.NEXT_PUBLIC_API_VERSION || '1'}`;
    this.PREFIX = "/user";
  }

  // ==================== ACTUAL ENDPOINTS ====================
  get ME() {
    return "/user/me";
  }

  get EMAIL_CHANGE_REQUEST() {
    return "/user/email/request";
  }

  // ==================== 🚧 PLANNED ENDPOINTS (NOT YET IMPLEMENTED IN BACKEND) ====================

  /* 
   * ⚠️  WARNING: The following endpoints are NOT YET IMPLEMENTED in the backend
   * They are included here for future reference and planning purposes only
   */

  // Profile management (PLANNED - NOT IMPLEMENTED)
  get PROFILE() {
    return `${this.PREFIX}/profile`;
  }

  get UPDATE_PROFILE() {
    return `${this.PREFIX}/profile`;
  }

  get UPLOAD_AVATAR() {
    return `${this.PREFIX}/profile/avatar`;
  }

  // Security endpoints (PLANNED - NOT IMPLEMENTED)
  get CHANGE_PASSWORD() {
    return `${this.PREFIX}/security/password`;
  }

  get TOGGLE_2FA() {
    return `${this.PREFIX}/security/2fa`;
  }

  // Session management (PLANNED - NOT IMPLEMENTED)
  get SESSIONS() {
    return `${this.PREFIX}/sessions`;
  }

  get SESSION() {
    return (sessionId) => `${this.SESSIONS}/${sessionId}`;
  }

  // ==================== QUERY PARAMETER BUILDERS ====================

  // Build URL with query parameters
  buildUrl(baseUrl, params = {}) {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryString.append(key, value.toString());
      }
    });

    return `${baseUrl}?${queryString.toString()}`;
  }

  // Pagination helper
  withPagination(url, page = 1, limit = 10) {
    return this.buildUrl(url, { page, limit });
  }

  // Filter helper
  withFilters(url, filters = {}) {
    return this.buildUrl(url, filters);
  }

  // ==================== 👇 HOW TO USE ? 👇 ====================

  // 1. Get user sessions with pagination
  // const sessionsUrl = userEndpoints.withPagination(userEndpoints.SESSIONS, 1, 20);
  // Result: "/api/v1/users/sessions?page=1&limit=20"

  // 2. Update user profile
  // const profileUrl = userEndpoints.PROFILE;
  // Result: "/api/v1/user/profile"

  // 3. Combined pagination and filters
  // const sessionsWithFilters = userEndpoints.withFilters(
  //   userEndpoints.withPagination(userEndpoints.SESSIONS, 2, 15),
  //   { device: "mobile", active: true }
  // );
  // Result: "/api/v1/users/sessions?page=2&limit=15&device=mobile&active=true"

  // ==================== ENDPOINT GROUPS ====================

  // Group endpoints by functionality for better organization
  get groups() {
    return {
      // 🚧 PLANNED ENDPOINTS (NOT YET IMPLEMENTED)
      PLANNED: {
        PROFILE: {
          PROFILE: this.PROFILE,
          UPDATE_PROFILE: this.UPDATE_PROFILE,
          UPLOAD_AVATAR: this.UPLOAD_AVATAR,
        },
        SECURITY: {
          CHANGE_PASSWORD: this.CHANGE_PASSWORD,
          SESSIONS: this.SESSIONS,
        }
      }
    };
  }

  // ==================== UTILITY METHODS ====================

  // Get current API configuration
  get config() {
    return {
      base: this.BASE,
      version: this.VERSION,
      prefix: this.PREFIX,
      apiVersion: process.env.NEXT_PUBLIC_API_VERSION || '1',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

// Singleton instance
export const userEndpoints = new UserEndpoints();

// Default export for convenience
// export default userEndpoints;