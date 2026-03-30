import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeError } from "@/lib/utils/error-utils";

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
      
      // If it's a cancellation, we can let the thunk be aborted naturally or reject
      // Conventional RTK thunks return the error for rejection
      return thunkAPI.rejectWithValue(normalized.message);
    }
  });
};
