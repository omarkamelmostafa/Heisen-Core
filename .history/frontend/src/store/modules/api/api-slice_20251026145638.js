// frontend/src/store/modules/api/api-slice.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { securedClient } from "@/services/api/client/secured-client";
import { refreshToken } from "../auth/auth-thunks";

// Enhanced base query with auth interceptor
const baseQuery = async (args, api, extraOptions) => {
  let result = await securedClient(args, api, extraOptions);

  // Handle 401 errors with token refresh
  if (result.error && result.error.status === 401) {
    try {
      // Try to refresh token
      const refreshResult = await api.dispatch(refreshToken());

      if (refreshResult.payload) {
        // Retry original request with new token
        result = await securedClient(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch(logout());
      }
    } catch (error) {
      api.dispatch(logout());
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["Auth", "User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    verifyEmail: builder.mutation({
      query: (verificationData) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: verificationData,
      }),
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: resetData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
