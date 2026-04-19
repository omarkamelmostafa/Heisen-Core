// frontend/src/__tests__/unit/auth-service.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../../services/domain/auth-service";
import { publicClient, privateClient } from "../../services/api/client";
import StoreAccessor from "../../store/store-accessor";

// Unmock the service itself so we can test its real logic
vi.unmock("../../services/domain/auth-service");
vi.unmock("@/services/domain/auth-service");

// Mock the dependencies of the service
vi.mock("../../services/api/client", () => ({
  publicClient: {
    post: vi.fn(),
  },
  privateClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../store/store-accessor", () => ({
  default: {
    dispatch: vi.fn(),
  },
}));

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login should call publicClient.post", async () => {
    const now = 123456789;
    vi.spyOn(Date, "now").mockReturnValue(now);
    
    publicClient.post.mockResolvedValue({ data: "success", status: 200 });
    const result = await authService.login({ email: "t@t.com", password: "p" });
    expect(publicClient.post).toHaveBeenCalledWith("/auth/login", { email: "t@t.com", password: "p" }, {});
    expect(result).toEqual({ data: "success", status: 200, headers: undefined, timestamp: now });
  });

  it("refreshToken should call publicClient.post and dispatch setAccessToken", async () => {
    publicClient.post.mockResolvedValue({ 
      data: { data: { accessToken: "new-token" } } 
    });
    const result = await authService.refreshToken();
    expect(publicClient.post).toHaveBeenCalledWith("/auth/refresh", {}, {});
    expect(StoreAccessor.dispatch).toHaveBeenCalled();
    expect(result.data.data.accessToken).toBe("new-token");
  });
});
