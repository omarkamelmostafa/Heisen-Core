// frontend/src/services/api/endpoints/admin-endpoints.js

/**
 * Enterprise Admin API Endpoints
 * Comprehensive admin endpoints for user management, analytics, and system administration
 */

class AdminEndpoints {
  constructor() {
    this.BASE = '/admin';
    this.VERSION = '/v1';
    this.PREFIX = `${this.BASE}${this.VERSION}`;
  }

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

  get SYSTEM_CACHE() {
    return `${this.SYSTEM}/cache`;
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

  get CONTENT_REJECT() {
    return (contentId) => `${this.CONTENT_MANAGE(contentId)}/reject`;
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

  // ==================== SUPPORT & TICKETS ====================

  get TICKETS() {
    return `${this.PREFIX}/tickets`;
  }

  get TICKET() {
    return (ticketId) => `${this.TICKETS}/${ticketId}`;
  }

  get TICKET_ASSIGN() {
    return (ticketId) => `${this.TICKET(ticketId)}/assign`;
  }

  get TICKET_CLOSE() {
    return (ticketId) => `${this.TICKET(ticketId)}/close`;
  }

  // ==================== QUERY BUILDERS ====================

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

  withPagination(url, page = 1, limit = 50) {
    return this.buildUrl(url, { page, limit });
  }

  withFilters(url, filters = {}) {
    return this.buildUrl(url, filters);
  }

  withDateRange(url, startDate, endDate) {
    return this.buildUrl(url, { startDate, endDate });
  }

  // ==================== ENDPOINT VALIDATION ====================

  validateEndpoint(endpoint, params = {}) {
    const validations = {
      USER: ['userId'],
      USER_SUSPEND: ['userId'],
      USER_ACTIVATE: ['userId'],
      USER_ROLES: ['userId'],
      USER_PERMISSIONS: ['userId'],
      REPORT: ['reportId'],
      CONTENT_MANAGE: ['contentId'],
      CONTENT_APPROVE: ['contentId'],
      CONTENT_REJECT: ['contentId'],
      SUBSCRIPTION: ['subscriptionId'],
      INVOICE: ['invoiceId'],
      TICKET: ['ticketId'],
      TICKET_ASSIGN: ['ticketId'],
      TICKET_CLOSE: ['ticketId'],
    };

    const requiredParams = validations[endpoint];
    if (requiredParams) {
      requiredParams.forEach(param => {
        if (!params[param]) {
          throw new Error(`Missing required parameter '${param}' for endpoint ${endpoint}`);
        }
      });
    }

    return true;
  }

  // ==================== ENDPOINT GROUPS ====================

  get groups() {
    return {
      USERS: {
        LIST: this.USERS,
        MANAGE: this.USER,
        SUSPEND: this.USER_SUSPEND,
        ACTIVATE: this.USER_ACTIVATE,
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
        REJECT: this.CONTENT_REJECT,
      },
      BILLING: {
        SUBSCRIPTIONS: this.SUBSCRIPTIONS,
        INVOICES: this.INVOICES,
      },
      SUPPORT: {
        TICKETS: this.TICKETS,
        TICKET: this.TICKET,
      },
    };
  }
}

// Singleton instance
export const adminEndpoints = new AdminEndpoints();
export default adminEndpoints;
