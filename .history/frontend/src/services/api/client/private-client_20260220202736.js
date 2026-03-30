// frontend/src/services/api/client/private-client.js
import BaseClient from "./base-client";
import { cookieService } from "@/services/storage/cookie-service";
import StoreAccessor from "@/store/store-accessor";
import { logoutUser } from "@/store/slices/auth/auth-thunks";
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

  // Inject authorization token into requests
  async injectAuthToken(config) {
    // Skip auth for certain endpoints
    if (this.shouldSkipAuth(config.url)) {
      return config;
    }

    const token = cookieService.getAccessToken();

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] = this.generateRequestId();

    return config;
  }

  // Handle authentication errors with retry logic
  /**
  * Enhanced auth error handler with refresh queue
  */
  async handleAuthError(error) {
    const originalRequest = error.config;

    // Check if it's an auth error and we should retry
    if (this.shouldRetryWithRefresh(error, originalRequest)) {
      try {
        console.log('SecuredClient: Token expired, using refresh queue');

        // Use refresh queue instead of direct refresh
        const newTokens = await refreshQueue.handleTokenRefresh({
          config: originalRequest,
          instance: this.instance,
          error: error
        });

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return this.instance(originalRequest);

      } catch (refreshError) {
        console.error('SecuredClient: Refresh queue failed', refreshError);
        return Promise.reject(this.normalizeError(refreshError));
      }
    }

    // Non-retryable error
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

  // Handle complete authentication failure
  async handleRefreshFailure() {
    // Clear local tokens
    cookieService.clearAuthData();

    // Dispatch logout action
    await StoreAccessor.dispatch(logoutUser());

    // Redirect to login with return URL
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
    }
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
