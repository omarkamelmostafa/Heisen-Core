import { beforeEach, describe, expect, it, vi } from "vitest";

// Rule T2: top-level mocks only
vi.mock("axios", () => {
  const mockAxiosInstance = vi.fn();
  mockAxiosInstance.interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  mockAxiosInstance.get = vi.fn();
  mockAxiosInstance.post = vi.fn();
  mockAxiosInstance.put = vi.fn();
  mockAxiosInstance.delete = vi.fn();

  return {
    default: {
      create: vi.fn().mockReturnValue(mockAxiosInstance),
      post: vi.fn(), // plain axios.post used for refresh
    },
  };
});

vi.mock("@/lib/config/api-config", () => ({
  API_CONFIG: {
    FULL_BASE_URL: "http://test.local/api/v1",
    TIMEOUT: 12345,
    HEADERS: { "Content-Type": "application/json" },
  },
  HTTP_STATUS: { UNAUTHORIZED: 401 },
  ERROR_MESSAGES: {},
}));

vi.mock("@/store/store-accessor", () => ({
  default: {
    dispatch: vi.fn(),
    getState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

vi.mock("@/store/slices/auth/auth-slice", () => ({
  clearCredentials: vi.fn(() => ({ type: "auth/clearCredentials" })),
  setSessionExpired: vi.fn((value) => ({ type: "auth/setSessionExpired", payload: value })),
  updateAccessToken: vi.fn((token) => ({ type: "auth/updateAccessToken", payload: token })),
}));

vi.mock("@/lib/notifications/notify", () => ({
  NotificationService: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}));

vi.mock("@/lib/i18n/api-error-translator", () => ({
  translateInterceptor: vi.fn((key) => key),
}));

vi.mock("@/lib/utils/error-utils", () => ({
  normalizeError: vi.fn((err) => err),
}));

describe("BaseClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // resets module-scoped isRefreshing / failedQueue between tests
  });

  const importSut = async () => {
    const mod = await import("@/services/api/client/base-client");
    return mod.default;
  };

  const getMocks = async () => {
    const axiosMod = await import("axios");
    const axios = axiosMod.default;
    const storeAccessor = (await import("@/store/store-accessor")).default;
    const authSlice = await import("@/store/slices/auth/auth-slice");
    const { NotificationService } = await import("@/lib/notifications/notify");
    const { translateInterceptor } = await import("@/lib/i18n/api-error-translator");
    return { axios, storeAccessor, authSlice, NotificationService, translateInterceptor };
  };

  const createClientAndCaptureHandlers = async () => {
    const BaseClient = await importSut();
    const { axios } = await getMocks();

    let requestSuccessHandler;
    let requestErrorHandler;
    let responseSuccessHandler;
    let responseErrorHandler;

    axios.create().interceptors.request.use.mockImplementation((onSuccess, onError) => {
      requestSuccessHandler = onSuccess;
      requestErrorHandler = onError;
    });

    axios.create().interceptors.response.use.mockImplementation((onSuccess, onError) => {
      responseSuccessHandler = onSuccess;
      responseErrorHandler = onError;
    });

    const client = new BaseClient();

    return {
      client,
      requestSuccessHandler,
      requestErrorHandler,
      responseSuccessHandler,
      responseErrorHandler,
    };
  };

  describe("initialization", () => {
    it("creates an axios instance on construction", async () => {
      const BaseClient = await importSut();
      const { axios } = await getMocks();

      // eslint-disable-next-line no-new
      new BaseClient();

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "http://test.local/api/v1",
          timeout: 12345,
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        })
      );
    });

    it("registers request interceptors on construction", async () => {
      await createClientAndCaptureHandlers();
      const { axios } = await getMocks();

      expect(axios.create().interceptors.request.use).toHaveBeenCalledTimes(1);
      expect(axios.create().interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("registers response interceptors on construction", async () => {
      await createClientAndCaptureHandlers();
      const { axios } = await getMocks();

      expect(axios.create().interceptors.response.use).toHaveBeenCalledTimes(1);
      expect(axios.create().interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe("response interceptor — 401 TOKEN_EXPIRED", () => {
    it("attempts token refresh on 401 with TOKEN_EXPIRED errorCode", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { axios, NotificationService } = await getMocks();

      axios.post.mockResolvedValueOnce({ data: { data: { accessToken: "new-token" } } });
      axios.create().mockResolvedValueOnce({ ok: true });

      const error = {
        config: { _retry: false, url: "/api/test", headers: {} },
        response: { status: 401, data: { errorCode: "TOKEN_EXPIRED" } },
      };

      await responseErrorHandler(error);

      expect(axios.post).toHaveBeenCalledWith(
        "http://test.local/api/v1/auth/refresh",
        {},
        { withCredentials: true }
      );

      expect(NotificationService.error).not.toHaveBeenCalled();
      expect(NotificationService.warn).not.toHaveBeenCalled();
      expect(NotificationService.info).not.toHaveBeenCalled();
      expect(NotificationService.success).not.toHaveBeenCalled();
      expect(NotificationService.loading).not.toHaveBeenCalled();
      expect(NotificationService.dismiss).not.toHaveBeenCalled();
      expect(NotificationService.promise).not.toHaveBeenCalled();
    });

    it("queues concurrent requests while refresh is in progress", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { axios } = await getMocks();

      let refreshResolve;
      const refreshPromise = new Promise((resolve) => {
        refreshResolve = resolve;
      });
      axios.post.mockReturnValueOnce(refreshPromise);

      axios.create()
        .mockResolvedValueOnce({ ok: "first" })
        .mockResolvedValueOnce({ ok: "second" });

      const err1 = {
        config: { _retry: false, url: "/a", headers: {} },
        response: { status: 401, data: { errorCode: "TOKEN_EXPIRED" } },
      };
      const err2 = {
        config: { _retry: false, url: "/b", headers: {} },
        response: { status: 401, data: { errorCode: "TOKEN_EXPIRED" } },
      };

      const p1 = responseErrorHandler(err1);
      const p2 = responseErrorHandler(err2);

      expect(axios.post).toHaveBeenCalledTimes(1);

      refreshResolve({ data: { data: { accessToken: "queued-token" } } });
      await expect(p1).resolves.toEqual({ ok: "first" });
      await expect(p2).resolves.toEqual({ ok: "second" });
    });

    it("retries original request after successful token refresh", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { axios } = await getMocks();

      axios.post.mockResolvedValueOnce({ data: { data: { accessToken: "new-token" } } });
      axios.create().mockResolvedValueOnce({ ok: true });

      const originalConfig = { _retry: false, url: "/api/test", headers: {} };
      const error = {
        config: originalConfig,
        response: { status: 401, data: { errorCode: "TOKEN_EXPIRED" } },
      };

      await responseErrorHandler(error);

      expect(originalConfig.headers.Authorization).toBe("Bearer new-token");
      expect(axios.create()).toHaveBeenCalledWith(expect.objectContaining({ url: "/api/test" }));
    });

    it("clears session and shows session-expired toast when retry fails", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { axios, storeAccessor, authSlice, NotificationService } = await getMocks();

      const refreshErr = new Error("refresh failed");
      axios.post.mockRejectedValueOnce(refreshErr);

      const error = {
        config: { _retry: false, url: "/api/test", headers: {} },
        response: { status: 401, data: { errorCode: "TOKEN_EXPIRED" } },
      };

      await expect(responseErrorHandler(error)).rejects.toBe(refreshErr);

      expect(storeAccessor.dispatch).toHaveBeenCalledWith(authSlice.clearCredentials());
      expect(storeAccessor.dispatch).toHaveBeenCalledWith(authSlice.setSessionExpired(true));
      expect(NotificationService.warn).toHaveBeenCalledWith("sessionExpired", {
        id: "session-expired",
      });
    });

    it("shows session-expired toast when _retry already set on 401", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { storeAccessor, authSlice, NotificationService } = await getMocks();

      const error = {
        config: { _retry: true, url: "/api/test", headers: {} },
        response: { status: 401, data: { errorCode: "TOKEN_EXPIRED" } },
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(storeAccessor.dispatch).toHaveBeenCalledWith(authSlice.clearCredentials());
      expect(storeAccessor.dispatch).toHaveBeenCalledWith(authSlice.setSessionExpired(true));
      expect(NotificationService.warn).toHaveBeenCalledWith("sessionExpired", {
        id: "session-expired",
      });
    });
  });

  describe("response interceptor — network errors", () => {
    it("shows global-network toast when no response (network error)", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = { config: { url: "/api/test" } };
      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(NotificationService.error).toHaveBeenCalledWith("networkError", {
        id: "global-network",
      });
    });

    it("marks error as isGlobalError on network failure", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();

      const error = { config: { url: "/api/test" } };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(error.isGlobalError).toBe(true);
    });
  });

  describe("response interceptor — HTTP error codes", () => {
    it("shows global-403 toast on 403 response", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = {
        config: { url: "/api/test" },
        response: { status: 403, data: { errorCode: "FORBIDDEN" } },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(error.isGlobalError).toBe(true);
      expect(NotificationService.error).toHaveBeenCalledWith("forbidden", { id: "global-403" });
    });

    it("does NOT show toast on 403 with ACCOUNT_NOT_VERIFIED errorCode", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = {
        config: { url: "/api/test" },
        response: { status: 403, data: { errorCode: "ACCOUNT_NOT_VERIFIED" } },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(NotificationService.error).not.toHaveBeenCalled();
      expect(error.isGlobalError).not.toBe(true);
    });

    it("shows global-429 toast on 429 response", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = {
        config: { url: "/api/test" },
        response: { status: 429, data: {}, headers: { "retry-after": "120" } },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(error.isGlobalError).toBe(true);
      expect(NotificationService.warn).toHaveBeenCalledWith(expect.any(String), {
        id: "global-429",
      });
    });

    it("shows global-500 toast on 500 response", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = {
        config: { url: "/api/test" },
        response: { status: 500, data: {}, headers: {} },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(error.isGlobalError).toBe(true);
      expect(NotificationService.error).toHaveBeenCalledWith("serverError", { id: "global-500" });
    });

    it("shows global-5xx toast on 502 response", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = {
        config: { url: "/api/test" },
        response: { status: 502, data: {}, headers: {} },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(NotificationService.error).toHaveBeenCalledWith("serviceUnavailable", {
        id: "global-5xx",
      });
    });

    it("shows global-5xx toast on 503 response", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = {
        config: { url: "/api/test" },
        response: { status: 503, data: {}, headers: {} },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(NotificationService.error).toHaveBeenCalledWith("serviceUnavailable", {
        id: "global-5xx",
      });
    });

    it("shows global-5xx toast on 504 response", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = {
        config: { url: "/api/test" },
        response: { status: 504, data: {}, headers: {} },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(NotificationService.error).toHaveBeenCalledWith("serviceUnavailable", {
        id: "global-5xx",
      });
    });

    it("passes through other errors without toast", async () => {
      const { responseErrorHandler } = await createClientAndCaptureHandlers();
      const { NotificationService } = await getMocks();

      const error = {
        config: { url: "/api/test" },
        response: { status: 418, data: {}, headers: {} },
      };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(NotificationService.error).not.toHaveBeenCalled();
      expect(NotificationService.warn).not.toHaveBeenCalled();
      expect(error.isGlobalError).not.toBe(true);
    });
  });

  describe("response interceptor — success", () => {
    it("returns response on success", async () => {
      const { responseSuccessHandler } = await createClientAndCaptureHandlers();

      const response = { status: 200, data: { ok: true }, config: { metadata: {} } };
      expect(responseSuccessHandler(response)).toBe(response);
    });
  });
});

