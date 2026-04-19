// frontend/src/__tests__/unit/notify.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted mock for sonner toast
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  promise: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

import { NotificationService } from "@/lib/notifications/notify";

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Static class behavior", () => {
    it("should throw error when attempting to instantiate", () => {
      expect(() => new NotificationService()).toThrow(
        "NotificationService is a static class and cannot be instantiated."
      );
    });

    it("should have correct default position", () => {
      expect(NotificationService.position).toBe("top-center");
    });
  });

  describe("success", () => {
    it("should call toast.success with message and default duration", () => {
      NotificationService.success("Test message");

      expect(mockToast.success).toHaveBeenCalledWith("Test message", {
        id: undefined,
        description: undefined,
        duration: 3500,
        action: undefined,
      });
    });

    it("should call toast.success with custom options", () => {
      const options = {
        id: "test-id",
        description: "Test description",
        duration: 5000,
        action: { label: "Undo" },
      };

      NotificationService.success("Test message", options);

      expect(mockToast.success).toHaveBeenCalledWith("Test message", options);
    });
  });

  describe("error", () => {
    it("should call toast.error with message and default duration", () => {
      NotificationService.error("Error message");

      expect(mockToast.error).toHaveBeenCalledWith("Error message", {
        id: undefined,
        description: undefined,
        duration: 6000,
        action: undefined,
      });
    });

    it("should call toast.error with custom options", () => {
      const options = {
        id: "error-id",
        description: "Error details",
        duration: 10000,
      };

      NotificationService.error("Error message", options);

      expect(mockToast.error).toHaveBeenCalledWith("Error message", options);
    });
  });

  describe("warn", () => {
    it("should call toast.warning with message and default duration", () => {
      NotificationService.warn("Warning message");

      expect(mockToast.warning).toHaveBeenCalledWith("Warning message", {
        id: undefined,
        description: undefined,
        duration: 5000,
        action: undefined,
      });
    });

    it("should call toast.warning with custom options", () => {
      const options = {
        id: "warn-id",
        description: "Warning details",
        duration: 8000,
      };

      NotificationService.warn("Warning message", options);

      expect(mockToast.warning).toHaveBeenCalledWith("Warning message", options);
    });
  });

  describe("info", () => {
    it("should call toast.info with message and default duration", () => {
      NotificationService.info("Info message");

      expect(mockToast.info).toHaveBeenCalledWith("Info message", {
        id: undefined,
        description: undefined,
        duration: 4000,
        action: undefined,
      });
    });

    it("should call toast.info with custom options", () => {
      const options = {
        id: "info-id",
        description: "Info details",
        duration: 6000,
      };

      NotificationService.info("Info message", options);

      expect(mockToast.info).toHaveBeenCalledWith("Info message", options);
    });
  });

  describe("promise", () => {
    it("should call toast.promise with promise and messages", () => {
      const promise = Promise.resolve();
      const messages = {
        loading: "Loading...",
        success: "Success!",
        error: "Error!",
      };

      NotificationService.promise(promise, messages);

      expect(mockToast.promise).toHaveBeenCalledWith(promise, messages);
    });

    it("should call toast.promise with empty messages by default", () => {
      const promise = Promise.resolve();

      NotificationService.promise(promise);

      expect(mockToast.promise).toHaveBeenCalledWith(promise, {});
    });
  });

  describe("loading", () => {
    it("should call toast.loading with message", () => {
      NotificationService.loading("Loading...");

      expect(mockToast.loading).toHaveBeenCalledWith("Loading...", {
        id: undefined,
        description: undefined,
        action: undefined,
      });
    });

    it("should call toast.loading with custom options", () => {
      const options = {
        id: "loading-id",
        description: "Please wait",
      };

      NotificationService.loading("Loading...", options);

      expect(mockToast.loading).toHaveBeenCalledWith("Loading...", options);
    });
  });

  describe("dismiss", () => {
    it("should call toast.dismiss with id", () => {
      NotificationService.dismiss("toast-id");

      expect(mockToast.dismiss).toHaveBeenCalledWith("toast-id");
    });

    it("should call toast.dismiss without id to dismiss all", () => {
      NotificationService.dismiss();

      expect(mockToast.dismiss).toHaveBeenCalledWith(undefined);
    });
  });
});
