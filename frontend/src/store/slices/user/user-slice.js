// frontend/src/store/slices/user/user-slice.js
import { createSlice } from "@reduxjs/toolkit";

// Import auth slice actions for extraReducers
import {
  setCredentials,
  clearCredentials,
  logout,
} from "../auth/auth-slice";

// Import auth thunks for extraReducers
import {
  loginUser,
  registerUser,
  verify2fa,
  bootstrapAuth,
  logoutAllDevices,
} from "../auth/auth-thunks";

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set profile directly (manual sync update)
    setProfile: (state, action) => {
      state.profile = action.payload;
    },

    // Update profile (manual sync update - merges partial data)
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
      state.error = null;
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

    // ==================== AUTH SLICE SYNC ACTIONS ====================

    // setCredentials: sets profile from payload.user
    builder.addCase(setCredentials, (state, action) => {
      state.profile = action.payload.user;
    });

    // clearCredentials: clears profile and error
    builder.addCase(clearCredentials, (state) => {
      state.profile = null;
      state.error = null;
    });

    // logout: clears profile and error
    builder.addCase(logout, (state) => {
      state.profile = null;
      state.error = null;
    });

    // ==================== AUTH THUNK ACTIONS ====================

    // loginUser.fulfilled: set profile from action.payload.data?.user
    // Note: No pending/rejected handlers - auth-slice owns loading/error for auth operations
    builder.addCase(loginUser.fulfilled, (state, action) => {
      if (action.payload.data?.requiresTwoFactor) {
        return;
      }
      state.profile = action.payload.data?.user;
    });

    // registerUser.fulfilled: set profile from action.payload.data?.user
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.profile = action.payload.data?.user;
    });

    // verify2fa.fulfilled: set profile from action.payload.data?.user
    builder.addCase(verify2fa.fulfilled, (state, action) => {
      state.profile = action.payload.data?.user;
    });

    // bootstrapAuth.rejected: clear profile (no valid session)
    builder.addCase(bootstrapAuth.rejected, (state) => {
      state.profile = null;
    });

    // logoutAllDevices.fulfilled: clear profile and error
    builder.addCase(logoutAllDevices.fulfilled, (state) => {
      state.profile = null;
      state.error = null;
    });

    // ==================== USER THUNK ACTIONS ====================
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
        if (action.payload?.data?.user) {
          state.profile = action.payload.data.user;
        }
        state.error = null;
      })
      .addCase("user/updateProfile/rejected", handleRejected)

      // Upload Avatar
      .addCase("user/uploadAvatar/pending", handlePending)
      .addCase("user/uploadAvatar/fulfilled", (state, action) => {
        if (action.payload?.data?.user) {
          state.profile = { ...state.profile, ...action.payload.data.user };
        }
        state.isLoading = false;
        state.error = null;
      })
      .addCase("user/uploadAvatar/rejected", (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Change Password
      .addCase("user/changePassword/pending", handlePending)
      .addCase("user/changePassword/fulfilled", (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase("user/changePassword/rejected", handleRejected)

      // Toggle 2FA
      .addCase("user/toggle2fa/pending", handlePending)
      .addCase("user/toggle2fa/fulfilled", (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.twoFactorEnabled = action.payload.data?.twoFactorEnabled;
        }
        state.error = null;
      })
      .addCase("user/toggle2fa/rejected", handleRejected);
  },
});

export const {
  setProfile,
  updateProfile,
  clearError,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
