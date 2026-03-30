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

    return `${this.PREFIX}/change-password`;
  }

  // Session management (PLANNED - NOT IMPLEMENTED)
  get SESSIONS() {
  return `${this.PREFIX}/sessions`;
}

  get SESSION() {
  return (sessionId) => `${this.SESSIONS}/${sessionId}`;
}

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

  // Two-factor authentication (PLANNED - NOT IMPLEMENTED)
  get TWO_FACTOR_SETUP() {
  return `${this.PREFIX}/2fa/setup`;
}

  get TWO_FACTOR_VERIFY() {
  return `${this.PREFIX}/2fa/verify`;
}

  get TWO_FACTOR_DISABLE() {
  return `${this.PREFIX}/2fa/disable`;
}

  get TWO_FACTOR_BACKUP_CODES() {
  return `${this.PREFIX}/2fa/backup-codes`;
}

  // Social authentication (PLANNED - NOT IMPLEMENTED)
  get SOCIAL_AUTH() {
  return (provider) => `${this.PREFIX}/social/${provider}`;
}

  get SOCIAL_CALLBACK() {
  return (provider) => `${this.PREFIX}/social/${provider}/callback`;
}

  get SOCIAL_CONNECT() {
  return (provider) => `${this.PREFIX}/social/${provider}/connect`;
}

  get SOCIAL_DISCONNECT() {
  return (provider) => `${this.PREFIX}/social/${provider}/disconnect`;
}

  // Security endpoints (PLANNED - NOT IMPLEMENTED)
  get SECURITY_LOGS() {
  return `${this.PREFIX}/security-logs`;
}

  get DEVICES() {
  return `${this.PREFIX}/devices`;
}

  get DEVICE() {
  return (deviceId) => `${this.DEVICES}/${deviceId}`;
}

  // Admin endpoints (PLANNED - NOT IMPLEMENTED)
  get ADMIN_USERS() {
  return `${this.PREFIX}/admin/users`;
}

  get ADMIN_USER() {
  return (userId) => `${this.ADMIN_USERS}/${userId}`;
}

  get ADMIN_USER_SUSPEND() {
  return (userId) => `${this.ADMIN_USERS}/${userId}/suspend`;
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

  // const url = authEndpoints.buildUrl(authEndpoints.USERS, {
  //   page: 1,
  //   limit: 10,
  //   search: "john",
  //   status: "active"
  // });

  // Result: "/api/v1/users?page=1&limit=10&search=john&status=active"


  // 1. Simple pagination
  // const usersPage1 = authEndpoints.withPagination(authEndpoints.USERS, 1, 20);
  // Result: "/api/v1/users?page=1&limit=20"

  // const usersPage2 = authEndpoints.withPagination(authEndpoints.USERS, 2);
  // Result: "/api/v1/users?page=2&limit=10" (uses default limit)

  // 2. Simple filters
  // const activeUsers = authEndpoints.withFilters(authEndpoints.USERS, {
  //   status: "active",
  //   role: "admin"
  // });
  // Result: "/api/v1/users?status=active&role=admin"



  // 3. Pagination + Filters (most common)
  // const searchResults = authEndpoints.withFilters(
  //   authEndpoints.withPagination(authEndpoints.USERS, 1, 25),
  //   {
  //     search: "john",
  //     department: "engineering",
  //     isActive: true
  //   }
  // );
  // Result: "/api/v1/users?page=1&limit=25&search=john&department=engineering&isActive=true"

  // 4. Chaining for complex queries
  // const complexQuery = authEndpoints.withFilters(
  //   authEndpoints.withPagination(authEndpoints.SESSIONS, 3, 50),
  //   {
  //     deviceType: "mobile",
  //     lastActiveAfter: "2024-01-01",
  //     country: "US"
  //   }
  // );
  // Result: "/api/v1/sessions?page=3&limit=50&deviceType=mobile&lastActiveAfter=2024-01-01&country=US"


  // ==================== ENDPOINT GROUPS ====================

  // Group endpoints by functionality for better organization
  get groups() {
  return {
    // ✅ ACTUALLY IMPLEMENTED ENDPOINTS
    IMPLEMENTED: {
      LOGIN: this.LOGIN,
      LOGOUT: this.LOGOUT,
      REGISTER: this.REGISTER,
      REFRESH_TOKEN: this.REFRESH_TOKEN,
      VERIFY_EMAIL: this.VERIFY_EMAIL,
      FORGOT_PASSWORD: this.FORGOT_PASSWORD,
      RESET_PASSWORD: this.RESET_PASSWORD,
    },

    // 🚧 PLANNED ENDPOINTS (NOT YET IMPLEMENTED)
    PLANNED: {
      PASSWORD: {
        CHANGE_PASSWORD: this.CHANGE_PASSWORD,
      },
      PROFILE: {
        PROFILE: this.PROFILE,
        UPDATE_PROFILE: this.UPDATE_PROFILE,
        UPLOAD_AVATAR: this.UPLOAD_AVATAR,
      },
      SECURITY: {
        SESSIONS: this.SESSIONS,
        SECURITY_LOGS: this.SECURITY_LOGS,
        DEVICES: this.DEVICES,
      },
      TWO_FACTOR: {
        SETUP: this.TWO_FACTOR_SETUP,
        VERIFY: this.TWO_FACTOR_VERIFY,
        DISABLE: this.TWO_FACTOR_DISABLE,
        BACKUP_CODES: this.TWO_FACTOR_BACKUP_CODES,
      },
      SOCIAL: {
        AUTH: this.SOCIAL_AUTH,
        CALLBACK: this.SOCIAL_CALLBACK,
        CONNECT: this.SOCIAL_CONNECT,
        DISCONNECT: this.SOCIAL_DISCONNECT,
      },
      ADMIN: {
        USERS: this.ADMIN_USERS,
        USER: this.ADMIN_USER,
        USER_SUSPEND: this.ADMIN_USER_SUSPEND,
      },
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
export const authEndpoints = new AuthEndpoints();

// Default export for convenience
// export default authEndpoints;