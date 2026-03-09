// frontend/src/services/api/interceptors/auth-interceptor.js
import { authService } from "@/services/domain/auth-service";

export class AuthInterceptor {
  constructor(securedClient) {
    this.securedClient = securedClient;
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - add auth token
    this.securedClient.interceptors.request.use(
      (config) => {
        const tokens = authService.getStoredTokens();

        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh
    this.securedClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = authService.getStoredTokens();

            if (tokens?.refreshToken) {
              // Refresh the token
              const response = await authService.refreshToken(
                tokens.refreshToken
              );
              const { accessToken, refreshToken } = response.data;

              // Store new tokens
              authService.storeTokens({ accessToken, refreshToken });

              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              // Retry the original request
              return this.securedClient(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            authService.clearTokens();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}
