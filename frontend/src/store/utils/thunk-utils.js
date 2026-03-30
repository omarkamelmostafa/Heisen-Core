// frontend/src/store/utils/thunk-utils.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeError } from "@/lib/utils/error-utils";
import { translateApiError } from "@/lib/i18n/api-error-translator";

/**
 * Standardized wrapper for createAsyncThunk with automatic error normalization.
 * 
 * @param {string} type - The action type string
 * @param {Function} payloadCreator - The async function to execute
 * @param {string} defaultErrorMessage - Fallback message if normalization fails
 * @returns {AsyncThunk}
 */
export const createAppThunk = (type, payloadCreator, defaultErrorMessage = "Action failed") => {
  return createAsyncThunk(type, async (arg, thunkAPI) => {
    try {
      return await payloadCreator(arg, thunkAPI);
    } catch (error) {
      const normalized = normalizeError(error, defaultErrorMessage);

      // Extract errorCode and raw message for translation
      let errorCode = normalized.errorCode || "UNKNOWN";
      const rawMessage = normalized.message;

      // Detect Axios network error (no response at all)
      if (!error?.response && error?.message === "Network Error") {
        errorCode = "NETWORK_ERROR";
      }

      // Translate the error message using errorCode
      const translatedMessage = translateApiError(errorCode, rawMessage);

      // If it's a cancellation, we can let the thunk be aborted naturally or reject
      // Conventional RTK thunks return the error for rejection
      return thunkAPI.rejectWithValue({
        message: translatedMessage,
        errorCode: errorCode,
        status: normalized.status,
        isGlobalError: normalized.originalError?.isGlobalError || false,
      });
    }
  });
};
