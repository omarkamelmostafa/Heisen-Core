// frontend/src/__tests__/unit/thunk-utils.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

// UNMOCK IT! setup.js mocks it globally.
vi.unmock("../../store/utils/thunk-utils");
vi.unmock("@/store/utils/thunk-utils");

import { createAppThunk } from "../../store/utils/thunk-utils";
import * as errorUtils from "../../lib/utils/error-utils";
import * as apiTranslator from "../../lib/i18n/api-error-translator";

vi.mock("../../lib/utils/error-utils");
vi.mock("../../lib/i18n/api-error-translator");

// Mock createAsyncThunk from RTK to capture the executor
import { createAsyncThunk } from "@reduxjs/toolkit";
vi.mock("@reduxjs/toolkit", async () => {
  const actual = await vi.importActual("@reduxjs/toolkit");
  return {
    ...actual,
    createAsyncThunk: vi.fn((type, executor) => {
      const thunk = (arg, thunkAPI) => executor(arg, thunkAPI);
      thunk.typePrefix = type;
      return thunk;
    }),
  };
});

describe("createAppThunk", () => {
  let thunkAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    thunkAPI = {
      dispatch: vi.fn(),
      rejectWithValue: vi.fn((val) => val),
    };
  });

  it("should handle successful execution", async () => {
    const payloadCreator = vi.fn().mockResolvedValue("success");
    const thunk = createAppThunk("test/type", payloadCreator);

    const result = await thunk("arg", thunkAPI);
    expect(result).toBe("success");
    expect(payloadCreator).toHaveBeenCalledWith("arg", thunkAPI);
  });

  it("should handle errors and normalize them", async () => {
    const error = new Error("Failed");
    const payloadCreator = vi.fn().mockRejectedValue(error);
    const thunk = createAppThunk("test/type", payloadCreator, "Fallback");

    errorUtils.normalizeError.mockReturnValue({
      message: "Normalized",
      errorCode: "ERR",
      status: 500,
    });
    apiTranslator.translateApiError.mockReturnValue("Translated");

    const result = await thunk("arg", thunkAPI);

    expect(thunkAPI.rejectWithValue).toHaveBeenCalledWith({
      message: "Translated",
      errorCode: "ERR",
      status: 500,
      isGlobalError: false,
    });
    expect(result).toEqual({
      message: "Translated",
      errorCode: "ERR",
      status: 500,
      isGlobalError: false,
    });
  });

  it("should detect network errors specifically", async () => {
    const error = new Error("Network Error");
    const payloadCreator = vi.fn().mockRejectedValue(error);
    const thunk = createAppThunk("test/type", payloadCreator);

    errorUtils.normalizeError.mockReturnValue({
      message: "Network Error",
      errorCode: "UNKNOWN",
    });
    apiTranslator.translateApiError.mockReturnValue("Network error");

    await thunk("arg", thunkAPI);

    expect(apiTranslator.translateApiError).toHaveBeenCalledWith("NETWORK_ERROR", "Network Error");
  });

  it("should use UNKNOWN errorCode if missing in normalized error", async () => {
    const error = new Error("Mystery");
    const payloadCreator = vi.fn().mockRejectedValue(error);
    const thunk = createAppThunk("test/type", payloadCreator);

    errorUtils.normalizeError.mockReturnValue({
      message: "Mystery message",
      errorCode: null,
    });

    await thunk("arg", thunkAPI);
    expect(apiTranslator.translateApiError).toHaveBeenCalledWith("UNKNOWN", "Mystery message");
  });

  it("should pass isGlobalError from original error", async () => {
    const error = new Error("Global");
    error.isGlobalError = true;
    const payloadCreator = vi.fn().mockRejectedValue(error);
    const thunk = createAppThunk("test/type", payloadCreator);

    errorUtils.normalizeError.mockReturnValue({
      message: "Global message",
      originalError: error
    });

    await thunk("arg", thunkAPI);
    expect(thunkAPI.rejectWithValue).toHaveBeenCalledWith(expect.objectContaining({
      isGlobalError: true
    }));
  });
});
