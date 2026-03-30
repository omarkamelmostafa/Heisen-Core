// frontend/src/services/api/interceptors/auth-interceptor.js
import { cookieService } from "@/services/storage/cookie-service";

export const authRequestInterceptor = (config) => {
  const token = cookieService.getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

export const authResponseInterceptor = (response) => {
  // Extract tokens from response if present
  if (response.data?.tokens) {
    const { accessToken, refreshToken } = response.data.tokens;
    if (accessToken && refreshToken) {
      cookieService.setTokens(accessToken, refreshToken);
    }
  }

  return response;
};
 