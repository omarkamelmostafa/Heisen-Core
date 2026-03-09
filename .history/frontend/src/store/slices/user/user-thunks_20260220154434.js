// frontend/src/store/slices/user/user-thunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "@/services/domain/user-service";
import { normalizeError } from "@/lib/utils/error-utils";
import {
  startLoading,
  setProfile,
  setError,
  updateProfile,
} from "./user-slice";

// Fetch user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Failed to fetch profile").message);
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Failed to update profile").message);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await userService.changePassword(passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Failed to change password").message);
    }
  }
);
