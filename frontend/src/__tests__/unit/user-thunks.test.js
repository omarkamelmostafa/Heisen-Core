// frontend/src/__tests__/unit/user-thunks.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.unmock("../../store/slices/user/user-thunks");
vi.unmock("@/store/slices/user/user-thunks");
vi.unmock("../../store/utils/thunk-utils");
vi.unmock("@/store/utils/thunk-utils");

import {
  fetchUserProfile,
  updateProfile,
  changePassword,
  requestEmailChange,
  toggle2fa,
  uploadAvatar,
} from "../../store/slices/user/user-thunks";
import { userService } from "../../services/domain/user-service";

vi.mock("../../services/domain/user-service", () => ({
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    requestEmailChange: vi.fn(),
    toggle2fa: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}));

describe("userThunks", () => {
  let dispatch;
  let getState;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatch = vi.fn();
    getState = vi.fn(() => ({}));
  });

  it("fetchUserProfile should call userService.getProfile", async () => {
    userService.getProfile.mockResolvedValue({ data: { user: { id: "1" } } });
    const action = fetchUserProfile();
    const result = await action(dispatch, getState, {});
    expect(userService.getProfile).toHaveBeenCalled();
    expect(result.payload).toEqual({ user: { id: "1" } });
  });

  it("updateProfile should call userService.updateProfile", async () => {
    userService.updateProfile.mockResolvedValue({ data: { success: true } });
    const action = updateProfile({ name: "New Name" });
    const result = await action(dispatch, getState, {});
    expect(userService.updateProfile).toHaveBeenCalled();
    expect(result.payload).toEqual({ success: true });
  });

  it("changePassword should call userService.changePassword", async () => {
    userService.changePassword.mockResolvedValue({ data: { success: true } });
    const action = changePassword({ old: "o", new: "n" });
    await action(dispatch, getState, {});
    expect(userService.changePassword).toHaveBeenCalled();
  });

  it("requestEmailChange should call userService.requestEmailChange", async () => {
    userService.requestEmailChange.mockResolvedValue({ data: { success: true } });
    const action = requestEmailChange({ email: "new@t.com" });
    await action(dispatch, getState, {});
    expect(userService.requestEmailChange).toHaveBeenCalled();
  });

  it("toggle2fa should call userService.toggle2fa", async () => {
    userService.toggle2fa.mockResolvedValue({ data: { success: true } });
    const action = toggle2fa({ enable: true });
    await action(dispatch, getState, {});
    expect(userService.toggle2fa).toHaveBeenCalled();
  });

  it("uploadAvatar should call userService.uploadAvatar", async () => {
    userService.uploadAvatar.mockResolvedValue({ data: { url: "http" } });
    const action = uploadAvatar({ file: "blob" });
    await action(dispatch, getState, {});
    expect(userService.uploadAvatar).toHaveBeenCalled();
  });
});
