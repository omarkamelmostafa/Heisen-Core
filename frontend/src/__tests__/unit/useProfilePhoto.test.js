import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import React from "react";

const mockRedux = vi.hoisted(() => ({
  dispatch: vi.fn(),
}));

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDispatch: () => mockRedux.dispatch,
  };
});

vi.mock("@/lib/notifications/notify", () => ({
  NotificationService: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import authReducer from "@/store/slices/auth/auth-slice";
import userReducer from "@/store/slices/user/user-slice";
import { uploadAvatar } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notifications/notify";
import { useProfilePhoto } from "@/features/user/hooks/useProfilePhoto";

function createWrapper(preloadedState = {}) {
  const store = configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState,
  });

  function Wrapper({ children }) {
    return React.createElement(Provider, { store }, children);
  }

  return { Wrapper, store };
}

function installFileReader(result = "data:image/jpeg;base64,mock-photo") {
  class MockFileReader {
    onload = null;

    readAsDataURL() {
      this.onload?.({ target: { result } });
    }
  }

  vi.stubGlobal("FileReader", MockFileReader);
}

describe("useProfilePhoto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockRedux.dispatch.mockImplementation((action) => action);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initial state", () => {
    it("returns null previewUrl initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      expect(result.current.previewUrl).toBeNull();
    });

    it("returns false isUploading initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      expect(result.current.isUploading).toBe(false);
    });

    it("returns false hasSelectedFile initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      expect(result.current.hasSelectedFile).toBe(false);
    });
  });

  describe("handleFileSelect", () => {
    it("sets selectedFile and previewUrl when file provided", async () => {
      installFileReader();
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [mockFile], value: "avatar.jpg" },
        });
      });

      await waitFor(() => {
        expect(result.current.previewUrl).toBe("data:image/jpeg;base64,mock-photo");
      });
    });

    it("returns early when no file provided", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [], value: "" },
        });
      });

      expect(result.current.previewUrl).toBeNull();
      expect(result.current.hasSelectedFile).toBe(false);
    });

    it("sets hasSelectedFile to true when file selected", async () => {
      installFileReader();
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [mockFile], value: "avatar.jpg" },
        });
      });

      await waitFor(() => {
        expect(result.current.hasSelectedFile).toBe(true);
      });
    });
  });

  describe("handleUpload", () => {
    it("returns early when no file selected", async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleUpload();
      });

      expect(mockRedux.dispatch).not.toHaveBeenCalled();
      expect(uploadAvatar).not.toHaveBeenCalled();
    });

    it("calls NotificationService.success on successful upload", async () => {
      installFileReader();
      uploadAvatar.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [mockFile], value: "avatar.jpg" },
        });
      });

      await act(async () => {
        await result.current.handleUpload();
      });

      expect(NotificationService.success).toHaveBeenCalledWith("photoUpdated");
    });

    it("sets isUploading to false after success", async () => {
      installFileReader();
      uploadAvatar.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [mockFile], value: "avatar.jpg" },
        });
      });

      await act(async () => {
        await result.current.handleUpload();
      });

      expect(result.current.isUploading).toBe(false);
    });

    it("calls NotificationService.error when error is not global", async () => {
      installFileReader();
      uploadAvatar.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Upload failed" }),
      });
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [mockFile], value: "avatar.jpg" },
        });
      });

      await act(async () => {
        await result.current.handleUpload();
      });

      expect(NotificationService.error).toHaveBeenCalledWith("Upload failed");
    });

    it("does not call NotificationService when isGlobalError is true", async () => {
      installFileReader();
      uploadAvatar.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: true, message: "Global error" }),
      });
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [mockFile], value: "avatar.jpg" },
        });
      });

      await act(async () => {
        await result.current.handleUpload();
      });

      expect(NotificationService.error).not.toHaveBeenCalled();
      expect(NotificationService.success).not.toHaveBeenCalled();
    });
  });

  describe("handleCancel", () => {
    it("clears previewUrl after cancel", async () => {
      installFileReader();
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [mockFile], value: "avatar.jpg" },
        });
      });

      await waitFor(() => {
        expect(result.current.previewUrl).not.toBeNull();
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.previewUrl).toBeNull();
    });

    it("sets hasSelectedFile to false after cancel", async () => {
      installFileReader();
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useProfilePhoto(), { wrapper: Wrapper });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [mockFile], value: "avatar.jpg" },
        });
      });

      await waitFor(() => {
        expect(result.current.hasSelectedFile).toBe(true);
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.hasSelectedFile).toBe(false);
    });
  });
});
