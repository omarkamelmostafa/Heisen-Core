// frontend/src/store/slices/auth/__mocks__/auth-thunks.js
// Manual mock for auth-thunks — used by Vitest when vi.mock() targets auth-thunks
// This prevents the real thunks from loading their API service dependencies

import { vi } from "vitest";

const makeThunk = (type) => {
  const thunk = vi.fn(() => ({ type }));
  thunk.pending = { type: `${type}/pending`, match: (a) => a.type === `${type}/pending` };
  thunk.fulfilled = { type: `${type}/fulfilled`, match: (a) => a.type === `${type}/fulfilled` };
  thunk.rejected = { type: `${type}/rejected`, match: (a) => a.type === `${type}/rejected` };
  thunk.typePrefix = type;
  return thunk;
};

export const loginUser = makeThunk("auth/login");
export const registerUser = makeThunk("auth/register");
export const logoutUser = makeThunk("auth/logout");
export const logoutAllDevices = makeThunk("auth/logoutAll");
export const bootstrapAuth = makeThunk("auth/bootstrap");
export const verifyEmail = makeThunk("auth/verifyEmail");
export const resendVerification = makeThunk("auth/resendVerification");
export const forgotPassword = makeThunk("auth/forgotPassword");
export const resetPassword = makeThunk("auth/resetPassword");
export const verify2fa = makeThunk("auth/verify2fa");
export const resend2fa = makeThunk("auth/resend2fa");
