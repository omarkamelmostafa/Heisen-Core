// frontend/src/services/api/client/secured-client.js
import BaseClient from "./base-client";
import { tokenManager } from "@/services/storage/token-manager";
import { cookieService } from "@/services/storage/cookie-service";
import { store } from "@/store";
import { logoutUser } from "@/store/slices/auth/auth-thunks";
import { HTTP_STATUS } from "@/lib/config/api-config";

class SecuredClient extends BaseClient {
  constructor() {
    super();

    this.setupAuthInterceptors();
    this.pendingRequests = new Map();
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
  async handleAuthError(error) {
    const originalRequest = error.config;

    // Check if it's an auth error and we should retry
    if (this.shouldRetryWithRefresh(error, originalRequest)) {
      try {
        // Get new token using token manager
        const newToken = await tokenManager.refreshToken();

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return this.instance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await this.handleRefreshFailure();
        return Promise.reject(refreshError);
      }
    }

    // Non-retryable error or max retries exceeded
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
    await store.dispatch(logoutUser());

    // Redirect to login with return URL
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
    }
  }

  // Generate unique request ID
  generateRequestId() {
    return `req_${new Date().toISOString().replace(/T/, "-").slice(0, -13)}_${
      crypto.randomUUID().split("-")[0]
    }`;
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
    const cancelTokens = requests.map(() => this.createCancelToken());

    try {
      const responses = await Promise.all(
        requests.map((request, index) =>
          this.instance({
            ...request,
            cancelToken: cancelTokens[index].token,
          })
        )
      );

      return responses;
    } catch (error) {
      // Cancel all requests if one fails
      cancelTokens.forEach((token) => token.cancel("Batch request failed"));
      throw error;
    }
  }
}

// Singleton instance for secured routes
export const securedClient = new SecuredClient();
export default securedClient;
