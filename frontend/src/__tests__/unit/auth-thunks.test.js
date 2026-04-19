// frontend/src/__tests__/unit/auth-thunks.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

// UNMOCK IT! setup.js mocks it globally.
vi.unmock("../../store/slices/auth/auth-thunks");
vi.unmock("@/store/slices/auth/auth-thunks");
// Also unmock thunk-utils so the real wrapper logic runs
vi.unmock("../../store/utils/thunk-utils");
vi.unmock("@/store/utils/thunk-utils");

import {
  loginUser,
  logoutUser,
  bootstrapAuth,
  registerUser,
} from "../../store/slices/auth/auth-thunks";
import { authService } from "../../services/domain/auth-service";
import { tokenManager } from "../../services/auth/token-manager";
import { refreshQueue } from "../../services/api/refresh-queue";

vi.mock("../../services/domain/auth-service", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock("../../services/auth/token-manager", () => ({
  tokenManager: {
    clearSession: vi.fn(),
  }
}));

vi.mock("../../services/api/refresh-queue", () => ({
  refreshQueue: {
    clearQueue: vi.fn(),
  }
}));

describe("authThunks", () => {
  let dispatch;
  let getState;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatch = vi.fn();
    getState = vi.fn(() => ({}));
  });

  describe("loginUser", () => {
    it("should call authService.login and return data", async () => {
      const mockData = { user: { id: "1" }, accessToken: "token" };
      authService.login.mockResolvedValue({ data: { data: mockData } });

      const action = loginUser({ email: "test@test.com", password: "pw" });
      const result = await action(dispatch, getState, {});
      
      expect(authService.login).toHaveBeenCalled();
      expect(result.payload.data).toEqual(mockData);
    });
  });

  describe("logoutUser", () => {
    it("should clear queue and session", async () => {
      authService.logout.mockResolvedValue({ success: true });

      const action = logoutUser();
      await action(dispatch, getState, {});

      expect(refreshQueue.clearQueue).toHaveBeenCalled();
      expect(authService.logout).toHaveBeenCalled();
      expect(tokenManager.clearSession).toHaveBeenCalled();
    });
  });

  describe("bootstrapAuth", () => {
    it("should refresh token and dispatch actions if successful", async () => {
      const mockData = { accessToken: "new-token", user: { id: "1" } };
      authService.refreshToken.mockResolvedValue({ data: { data: mockData } });

      const action = bootstrapAuth();
      await action(dispatch, getState, {});

      expect(authService.refreshToken).toHaveBeenCalled();
      // Use matchers because RTK actions have weird metadata
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "auth/setAccessToken" }));
    });
  });
});
