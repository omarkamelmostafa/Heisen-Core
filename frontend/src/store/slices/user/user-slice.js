// frontend/src/store/slices/user/user-slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  preferences: {
    theme: "light",
    language: "en",
    notifications: true,
  },
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Update user preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Update profile (manual sync update)
    updateProfile: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear user data
    clearUser: (state) => {
      state.profile = null;
      state.preferences = initialState.preferences;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.error = null;
    };

    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "An error occurred";
    };

    builder
      // Fetch User Profile
      .addCase("user/fetchProfile/pending", handlePending)
      .addCase("user/fetchProfile/fulfilled", (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase("user/fetchProfile/rejected", handleRejected)

      // Update User Profile
      .addCase("user/updateProfile/pending", handlePending)
      .addCase("user/updateProfile/fulfilled", (state, action) => {
        state.isLoading = false;
        state.profile = action.payload; // Assuming backend returns full profile
        state.error = null;
      })
      .addCase("user/updateProfile/rejected", handleRejected)

      // Change Password
      .addCase("user/changePassword/pending", handlePending)
      .addCase("user/changePassword/fulfilled", (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase("user/changePassword/rejected", handleRejected);
  },
});

export const {
  updatePreferences,
  updateProfile,
  clearError,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
