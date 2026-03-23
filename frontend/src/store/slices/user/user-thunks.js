// frontend/src/store/slices/user/user-thunks.js
import { userService } from "@/services/domain/user-service";
import { createAppThunk } from "@/store/utils/thunk-utils";
import { showNotification } from "@/store/slices/ui";

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
export const updateProfile = createAppThunk(
  "user/updateProfile",
  async (profileData, { signal }) => {
    const response = await userService.updateProfile(profileData, { signal });
    return response.data;
  },
  "Failed to update profile"
);

// Change password
export const changePassword = createAppThunk(
  "user/changePassword",
  async (passwordData, { dispatch, signal }) => {
    const response = await userService.changePassword(passwordData, { signal });
    dispatch(
      showNotification({
        type: "success",
        title: "Password Changed",
        message: "Your password has been updated successfully",
      })
    );
    return response.data;
  },
  "Failed to change password"
);

export const requestEmailChange = createAppThunk(
  "user/requestEmailChange",
  async (data, { signal }) => {
    const response = await userService.requestEmailChange(data, { signal });
    return response.data;
  },
  "Failed to request email change"
);

