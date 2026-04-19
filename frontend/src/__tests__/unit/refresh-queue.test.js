import { beforeEach, describe, expect, it, vi } from "vitest";

// Rule T2: top-level mocks only (dependencies of refresh-queue.js)
vi.mock("@/services/auth/token-manager", () => ({
  tokenManager: {
    handleSessionExpired: vi.fn(),
  },
}));

vi.mock("@/services/domain/auth-service", () => ({
  authService: {
    refreshToken: vi.fn(),
  },
}));

// The global test setup mocks this module; for this unit test we need the real implementation.
vi.unmock("@/services/api/refresh-queue");

describe("RefreshQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const importSut = async () => {
    const mod = await import("@/services/api/refresh-queue");
    return mod;
  };

  const resetQueue = async () => {
    const mod = await importSut();
    // Default export is a singleton instance (class is not exported)
    mod.default.clearQueue();
    return mod.default;
  };

  describe("initial state", () => {
    it("starts with isRefreshing false", async () => {
      const queue = await resetQueue();
      expect(queue.getQueueStatus().isRefreshing).toBe(false);
    });

    it("starts with empty pending requests", async () => {
      const queue = await resetQueue();
      expect(queue.getQueueStatus().pendingRequests).toBe(0);
    });
  });

  describe("addToQueue", () => {
    it("adds request to pending queue", async () => {
      const queue = await resetQueue();
      queue.addToQueue({ config: { url: "/x" }, instance: vi.fn() });
      expect(queue.getQueueStatus().pendingRequests).toBe(1);
    });

    it("increments pending queue length on each addToQueue", async () => {
      const queue = await resetQueue();
      queue.addToQueue({ config: { url: "/x" }, instance: vi.fn() });
      queue.addToQueue({ config: { url: "/y" }, instance: vi.fn() });
      expect(queue.getQueueStatus().pendingRequests).toBe(2);
    });
  });

  describe("processQueue — success", () => {
    it("clears pending queue after processing", async () => {
      const queue = await resetQueue();
      const instance = vi.fn().mockResolvedValue({ ok: true });

      queue.addToQueue({ config: { url: "/x", headers: {} }, instance });
      await queue.processQueue("new-token");

      expect(queue.getQueueStatus().pendingRequests).toBe(0);
    });

    it("retries each pending request with _retry flag set", async () => {
      const queue = await resetQueue();
      const instance = vi.fn().mockResolvedValue({ ok: true });

      queue.addToQueue({ config: { url: "/x", headers: {} }, instance });
      await queue.processQueue("new-token");

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/x",
          _retry: true,
        })
      );
    });
  });

  describe("processQueue — failure", () => {
    it("clears pending queue after processing failure", async () => {
      const queue = await resetQueue();
      const instance = vi.fn().mockRejectedValue(new Error("boom"));

      queue.addToQueue({ config: { url: "/x", headers: {} }, instance });

      await queue.processQueue("new-token"); // uses Promise.allSettled; should not throw

      expect(queue.getQueueStatus().pendingRequests).toBe(0);
    });
  });

  describe("clearQueue", () => {
    it("empties the pending requests array", async () => {
      const queue = await resetQueue();
      queue.addToQueue({ config: { url: "/x" }, instance: vi.fn() });
      queue.clearQueue();
      expect(queue.getQueueStatus().pendingRequests).toBe(0);
    });

    it("resets isRefreshing to false", async () => {
      const queue = await resetQueue();
      queue.isRefreshing = true;
      queue.clearQueue();
      expect(queue.getQueueStatus().isRefreshing).toBe(false);
    });
  });

  describe("getQueueStatus", () => {
    it("returns false initially", async () => {
      const queue = await resetQueue();
      expect(queue.getQueueStatus().isRefreshing).toBe(false);
    });

    it("returns updated value after setter", async () => {
      const queue = await resetQueue();
      queue.isRefreshing = true;
      expect(queue.getQueueStatus().isRefreshing).toBe(true);
    });
  });
});

