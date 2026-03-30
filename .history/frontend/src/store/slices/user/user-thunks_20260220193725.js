// frontend/src/store/slices/user/user-thunks.js
import { userService } from "@/services/domain/user-service";
import { createAppThunk } from "@/store/utils/thunk-utils";
import {
  startLoading,
  setProfile,
  setError,
  updateProfile,
} from "./user-slice";

// Fetch user profile
export const fetchUserProfile = createAppThunk(
  "user/fetchProfile",
  async (_, { signal }) => {
    const response = await userService.getProfile({ signal });
    return response.data;
  },
  "Failed to fetch profile"
);

// Update user profile
export const updateUserProfile = createAppThunk(
  "user/updateProfile",
  async (profileData, { signal }) => {
    const response = await userService.updateProfile({ ...profileData, config: { signal } });
    return response.data;
  },
  "Failed to update profile"
);

// Change password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData, { rejectWithValue, signal }) => {
    try {
      const response = await userService.changePassword({ ...passwordData, config: { signal } });
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error, "Failed to change password").message);
    }
  }
);
