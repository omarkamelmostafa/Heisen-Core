// frontend/src/services/api/client/private-client.js
import BaseClient from "./base-client";
import { tokenManager } from "@/services/auth/token-manager";
import { HTTP_STATUS } from "@/lib/config/api-config";
import { refreshQueue } from "@/services/api/refresh-queue";
import StoreAccessor from "@/store/store-accessor";

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
    // Auth request interceptor — injects access token from Redux
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

  /**
   * Inject the access token from Redux state into the Authorization header.
   * Since the access token is no longer in a cookie (FR-010), we must
   * read it from Redux and attach it manually.
   */
  async injectAuthToken(config) {
    if (this.shouldSkipAuth(config.url)) {
      return config;
    }

    // Read access token from Redux state (memory-only)
    try {
      const state = StoreAccessor.getState();
      const accessToken = state?.auth?.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch {
      // Store not yet initialized — token will be missing, 401 triggers refresh
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] = this.generateRequestId();

    return config;
  }

  /**
   * Enhanced auth error handler with three-path flow:
   *   1. No token present → immediate redirect (unauthenticated access)
   *   2. Expired token    → attempt refresh via refreshQueue
   *   3. Refresh fails    → refreshQueue.handleAuthFailure() handles cleanup
   */
  async handleAuthError(error) {
    const originalRequest = error.config;

    // PATH 1: No tokens present — short-circuit to login
    if (!tokenManager.hasValidSession()) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(this.normalizeError(error));
    }

    // PATH 2: Expired token — attempt refresh via queue
    if (this.shouldRetryWithRefresh(error, originalRequest)) {
      try {
        await refreshQueue.handleTokenRefresh({
          config: originalRequest,
          instance: this.instance,
          error: error,
        });

        // After successful refresh, re-inject the new access token
        // (the refresh thunk/service will have updated Redux state)
        const state = StoreAccessor.getState();
        const newToken = state?.auth?.accessToken;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Retry original request with updated token
        return this.instance(originalRequest);
      } catch (refreshError) {
        // PATH 3: Refresh failed — refreshQueue.handleAuthFailure() already
        // handled cleanup (logout + redirect). Just propagate the error.
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
    const isAuthError = error.response?.status === HTTP_STATUS.UNAUTHORIZED;
    const isFirstAttempt = !config._retry;
    const canRetryEndpoint = !this.shouldSkipAuth(config.url);
    return isAuthError && isFirstAttempt && canRetryEndpoint;
  }

  // Generate unique request ID
  generateRequestId() {
    return `req_${new Date()
      .toISOString()
      .replace(/T/, "-")
      .slice(0, -13)}_${crypto.randomUUID().split("-")[0]}`;
  }

  setupEnhancedLogging() {
    this.instance.interceptors.request.use((config) => {
      config.metadata = { startTime: Date.now() };
      if (process.env.NODE_ENV === "development") {
        this.sanitizedLog("REQUEST", config);
      }
      return config;
    });
  }

  sanitizedLog(type, config) {
    const sanitizedHeaders = this.sanitizeHeaders(config.headers);
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(`🔒 [SECURE] ${type}`, sanitizedHeaders);
    }
  }

  sanitizeHeaders(headers) {
    if (!headers) return {};
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = "Bearer [REDACTED]";
    }
    if (sanitized.Cookie) {
      sanitized.Cookie = "[REDACTED]";
    }
    return sanitized;
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
