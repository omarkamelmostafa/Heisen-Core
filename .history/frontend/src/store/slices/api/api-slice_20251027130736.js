// frontend/src/store/slices/api/api-slice.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { publicClient } from "@/services/api/client/public-client";
import publicClient from "@/services/api/client/public-client";
import { authService } from "@/services/domain/auth-service";

// Enhanced base query with auth interceptor
const baseQuery = async (args, api, extraOptions) => {
  try {
    // Use publicClient for unauthenticated requests
    let result = await publicClient(args);

    // If we need authenticated requests, we'll handle them differently
    // For now, all RTK Query requests go through publicClient
    return result;
  } catch (error) {
    return { error };
  }
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
