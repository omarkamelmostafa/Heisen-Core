// backend/__tests__/unit/login.controller.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleLogin } from "../../controllers/auth/login.controller.js";
import { loginUseCase } from "../../use-cases/auth/index.js";
import { setRefreshTokenCookie } from "../../services/auth/cookie-service.js";
import { sendUseCaseResponse } from "../../controllers/auth/auth-shared.js";

vi.mock("../../use-cases/auth/index.js");
vi.mock("../../services/auth/cookie-service.js");
vi.mock("../../controllers/auth/auth-shared.js");

describe("handleLogin controller", () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      body: { email: "test@test.com", password: "password", rememberMe: true },
      headers: { "user-agent": "test-agent" },
      ip: "127.0.0.1",
    };
    res = {};
  });

  it("should call loginUseCase and set cookie on success", async () => {
    const mockResult = {
      success: true,
      data: { refreshTokenValue: "raw-refresh", accessToken: "access" },
    };
    loginUseCase.mockResolvedValue(mockResult);

    await handleLogin(req, res);

    expect(loginUseCase).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password",
      userAgent: "test-agent",
      ipAddress: "127.0.0.1",
      rememberMe: true,
    });
    expect(setRefreshTokenCookie).toHaveBeenCalledWith(res, "raw-refresh", true);
    expect(sendUseCaseResponse).toHaveBeenCalledWith(req, res, expect.objectContaining({
      success: true,
      data: { accessToken: "access" }
    }));
  });

  it("should not set cookie on failure", async () => {
    const mockResult = { success: false, statusCode: 401 };
    loginUseCase.mockResolvedValue(mockResult);

    await handleLogin(req, res);

    expect(setRefreshTokenCookie).not.toHaveBeenCalled();
    expect(sendUseCaseResponse).toHaveBeenCalledWith(req, res, mockResult);
  });

  it("should handle missing user-agent", async () => {
    req.headers = {};
    loginUseCase.mockResolvedValue({ success: false });

    await handleLogin(req, res);

    expect(loginUseCase).toHaveBeenCalledWith(expect.objectContaining({
      userAgent: ""
    }));
  });
});
