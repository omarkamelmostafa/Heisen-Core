// frontend/src/services/api/client/private-client.js
import BaseClient from "./base-client";
import { tokenManager } from "@/services/auth/token-manager";
import { HTTP_STATUS } from "@/lib/config/api-config";
import { refreshQueue } from "@/services/api/refresh-queue";

class PrivateClient extends BaseClient {
  constructor() {
    super();

    // Override base interceptors for private routes
    this.setupAuthInterceptors();
    this.pendingRequests = new Map();

    // Add useful logging from logging-interceptor
    this.setupEnhancedLogging();
  }

  setupAuthInterceptors() {
    // Auth request interceptor
    this.instance.interceptors.request.use(
      this.injectAuthToken.bind(this),
      (error) => Promise.reject(error)
    );

    // Auth response interceptor with retry logic
    this.instance.interceptors.response.use(
      (response) => response,
      this.handleAuthError.bind(this)
    );
  }

  // Inject tracking headers (authentication is now automatic via cookies)
  async injectAuthToken(config) {
    // Skip auth check logic if needed, but cookies are sent by browser
    if (this.shouldSkipAuth(config.url)) {
      return config;
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] = this.generateRequestId();

    return config;
  }

  // Handle authentication errors with retry logic
  /**
   * Enhanced auth error handler with three-path flow:
   *   1. No token present → immediate redirect (unauthenticated access)
   *   2. Expired token    → attempt refresh via refreshQueue
   *   3. Refresh fails    → refreshQueue.handleAuthFailure() handles cleanup
   */
  async handleAuthError(error) {
    const originalRequest = error.config;

    // PATH 1: No tokens present — short-circuit to login
    // Unauthenticated users should never trigger refresh logic
    if (!tokenManager.hasValidSession()) {
      console.log('PrivateClient: No tokens present, redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(this.normalizeError(error));
    }

    // PATH 2: Expired token — attempt refresh via queue
    if (this.shouldRetryWithRefresh(error, originalRequest)) {
      try {
        console.log('PrivateClient: Token expired, delegating to refresh queue');

        await refreshQueue.handleTokenRefresh({
          config: originalRequest,
          instance: this.instance,
          error: error
        });

        // Retry original request (cookies are set automatically by browser)
        return this.instance(originalRequest);

      } catch (refreshError) {
        // PATH 3: Refresh failed — refreshQueue.handleAuthFailure() already
        // handled cleanup (logout + redirect). Just propagate the error.
        console.error('PrivateClient: Refresh failed, auth failure handled by queue');
        return Promise.reject(this.normalizeError(refreshError));
      }
    }

    // Non-retryable error (e.g., 403 Forbidden)
    return Promise.reject(this.normalizeError(error));
  }



  // Check if request should skip auth
  shouldSkipAuth(url) {
    const skipAuthEndpoints = ["/auth/refresh", "/auth/logout", "/public/"];

    return skipAuthEndpoints.some((endpoint) => url.includes(endpoint));
  }

  // Determine if request should be retried with token refresh
  shouldRetryWithRefresh(error, config) {
    // Only retry on specific status codes
    const isAuthError = error.response?.status === HTTP_STATUS.UNAUTHORIZED;

    // Check if this is the first retry attempt
    const isFirstAttempt = !config.__isRetry;

    // Check if endpoint supports retry (not auth endpoints)
    const canRetryEndpoint = !this.shouldSkipAuth(config.url);

    return isAuthError && isFirstAttempt && canRetryEndpoint;
  }



  // Generate unique request ID
  generateRequestId() {
    return `req_${new Date().toISOString().replace(/T/, "-").slice(0, -13)}_${crypto.randomUUID().split("-")[0]
      }`;
  }


  setupEnhancedLogging() {
    this.instance.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        if (process.env.NODE_ENV === "development") {
          this.sanitizedLog("REQUEST", config);
        }
        return config;
      }
    );
  }

  sanitizedLog(type, config) {
    // Copy the sanitization logic only
    const sanitizedHeaders = this.sanitizeHeaders(config.headers);
    if (process.env.NODE_ENV === "development") {
      console.log(`🔒 [SECURE] ${type}`, sanitizedHeaders);
    }
  }

  // Enhanced methods with automatic auth retry
  async securedGet(url, config = {}) {
    return this.get(url, config);
  }

  async securedPost(url, data = {}, config = {}) {
    return this.post(url, data, config);
  }

  async securedPut(url, data = {}, config = {}) {
    return this.put(url, data, config);
  }

  async securedPatch(url, data = {}, config = {}) {
    return this.patch(url, data, config);
  }

  async securedDelete(url, config = {}) {
    return this.delete(url, config);
  }

  // Batch requests (advanced feature)
  async batchRequests(requests) {
    const controllers = requests.map(() => this.createAbortController());

    try {
      const responses = await Promise.all(
        requests.map((request, index) =>
          this.instance({
            ...request,
            signal: controllers[index].signal,
          })
        )
      );

      return responses;
    } catch (error) {
      controllers.forEach((controller) => controller.abort());
      throw error;
    }
  }
}

// Singleton instance for secured routes
export const privateClient = new PrivateClient();
export default privateClient;
