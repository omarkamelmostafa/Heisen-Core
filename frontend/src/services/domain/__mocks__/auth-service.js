// frontend/src/services/domain/__mocks__/auth-service.js
// Manual mock for auth-service — prevents axios/interceptor chain from loading

import { vi } from "vitest";

export const authService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  logoutAll: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verify2FA: vi.fn(),
  resend2FA: vi.fn(),
  refreshAccessToken: vi.fn(),
  checkAuthStatus: vi.fn(),
};
