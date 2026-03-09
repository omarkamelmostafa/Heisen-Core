// frontend/src/services/api/endpoints/admin-endpoints.js

// Admin Management API endpoints configuration
// Centralized endpoint management for maintainability and type safety

class AdminEndpoints {
  constructor() {
    // Paths relative to axios base URL (already includes /api/v1)
    this.BASE = "/api";
    this.VERSION = `/v${process.env.NEXT_PUBLIC_API_VERSION || '1'}`;
    this.PREFIX = "/admin";
  }

  // ==================== 🚧 PLANNED ENDPOINTS (NOT YET IMPLEMENTED IN BACKEND) ====================

  /* 
   * ⚠️  WARNING: The following endpoints are NOT YET IMPLEMENTED in the backend
   * They are included here for future reference and planning purposes only
   */

  // ==================== USER MANAGEMENT ====================

  get USERS() {
    return `${this.PREFIX}/users`;
  }

  get USER() {
    return (userId) => `${this.USERS}/${userId}`;
  }

  get USER_SUSPEND() {
    return (userId) => `${this.USER(userId)}/suspend`;
  }

  get USER_ACTIVATE() {
    return (userId) => `${this.USER(userId)}/activate`;
  }

  get USER_ROLES() {
    return (userId) => `${this.USER(userId)}/roles`;
  }

  get USER_PERMISSIONS() {
    return (userId) => `${this.USER(userId)}/permissions`;
  }

  // ==================== ANALYTICS & REPORTING ====================

  get ANALYTICS() {
    return `${this.PREFIX}/analytics`;
  }

  get ANALYTICS_USERS() {
    return `${this.ANALYTICS}/users`;
  }

  get ANALYTICS_ACTIVITY() {
    return `${this.ANALYTICS}/activity`;
  }

  get ANALYTICS_REVENUE() {
    return `${this.ANALYTICS}/revenue`;
  }

  get REPORTS() {
    return `${this.PREFIX}/reports`;
  }

  get REPORT() {
    return (reportId) => `${this.REPORTS}/${reportId}`;
  }

  get REPORT_GENERATE() {
    return `${this.REPORTS}/generate`;
  }

  // ==================== SYSTEM MANAGEMENT ====================

  get SYSTEM() {
    return `${this.PREFIX}/system`;
  }

  get SYSTEM_HEALTH() {
    return `${this.SYSTEM}/health`;
  }

  get SYSTEM_METRICS() {
    return `${this.SYSTEM}/metrics`;
  }

  get SYSTEM_LOGS() {
    return `${this.SYSTEM}/logs`;
  }

  get SYSTEM_CONFIG() {
    return `${this.SYSTEM}/config`;
  }

  get SYSTEM_BACKUP() {
    return `${this.SYSTEM}/backup`;
  }

  // ==================== CONTENT MANAGEMENT ====================

  get CONTENT() {
    return `${this.PREFIX}/content`;
  }

  get CONTENT_UPLOAD() {
    return `${this.CONTENT}/upload`;
  }

  get CONTENT_MANAGE() {
    return (contentId) => `${this.CONTENT}/${contentId}`;
  }

  get CONTENT_APPROVE() {
    return (contentId) => `${this.CONTENT_MANAGE(contentId)}/approve`;
  }

  // ==================== BILLING & SUBSCRIPTIONS ====================

  get BILLING() {
    return `${this.PREFIX}/billing`;
  }

  get SUBSCRIPTIONS() {
    return `${this.BILLING}/subscriptions`;
  }

  get SUBSCRIPTION() {
    return (subscriptionId) => `${this.SUBSCRIPTIONS}/${subscriptionId}`;
  }

  get INVOICES() {
    return `${this.BILLING}/invoices`;
  }

  get INVOICE() {
    return (invoiceId) => `${this.INVOICES}/${invoiceId}`;
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
  withPagination(url, page = 1, limit = 50) {
    return this.buildUrl(url, { page, limit });
  }

  // Filter helper
  withFilters(url, filters = {}) {
    return this.buildUrl(url, filters);
  }

  // Date range helper
  withDateRange(url, startDate, endDate) {
    return this.buildUrl(url, { startDate, endDate });
  }

  // ==================== 👇 HOW TO USE ? 👇 ====================

  // 1. Get users with pagination and filters
  // const usersUrl = adminEndpoints.withFilters(
  //   adminEndpoints.withPagination(adminEndpoints.USERS, 1, 25),
  //   { role: "admin", status: "active" }
  // );
  // Result: "/api/v1/admin/users?page=1&limit=25&role=admin&status=active"

  // 2. Get analytics with date range
  // const analyticsUrl = adminEndpoints.withDateRange(
  //   adminEndpoints.ANALYTICS_USERS,
  //   "2024-01-01",
  //   "2024-01-31"
  // );
  // Result: "/api/v1/admin/analytics/users?startDate=2024-01-01&endDate=2024-01-31"

  // 3. Suspend a specific user
  // const suspendUrl = adminEndpoints.USER_SUSPEND("user-123");
  // Result: "/api/v1/admin/users/user-123/suspend"

  // ==================== ENDPOINT GROUPS ====================

  // Group endpoints by functionality for better organization
  get groups() {
    return {
      // 🚧 PLANNED ENDPOINTS (NOT YET IMPLEMENTED)
      PLANNED: {
        USER_MANAGEMENT: {
          USERS: this.USERS,
          USER: this.USER,
          USER_SUSPEND: this.USER_SUSPEND,
          USER_ACTIVATE: this.USER_ACTIVATE,
        },
        ANALYTICS: {
          OVERVIEW: this.ANALYTICS,
          USERS: this.ANALYTICS_USERS,
          ACTIVITY: this.ANALYTICS_ACTIVITY,
          REVENUE: this.ANALYTICS_REVENUE,
        },
        SYSTEM: {
          HEALTH: this.SYSTEM_HEALTH,
          METRICS: this.SYSTEM_METRICS,
          LOGS: this.SYSTEM_LOGS,
          CONFIG: this.SYSTEM_CONFIG,
        },
        CONTENT: {
          UPLOAD: this.CONTENT_UPLOAD,
          MANAGE: this.CONTENT_MANAGE,
          APPROVE: this.CONTENT_APPROVE,
        },
        BILLING: {
          SUBSCRIPTIONS: this.SUBSCRIPTIONS,
          INVOICES: this.INVOICES,
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
export const adminEndpoints = new AdminEndpoints();

// Default export for convenience
// export default adminEndpoints;