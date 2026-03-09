// frontend/src/store/slices/api/api-slice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { publicClient } from "@/services/api/client/public-client";
import { auth } from "@/services/api/endpoints";

// Enhanced base query with proper error handling
const baseQuery = async (args, api, extraOptions) => {
  try {
    const result = await publicClient({
      url: args.url,
      method: args.method,
      data: args.body,
      params: args.params,
    });

    return { data: result.data };
  } catch (error) {
    return {
      error: {
        status: error.response?.status,
        data: error.response?.data || error.message,
      },
    };
  }
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["Auth", "User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: authEndpoints.LOGIN,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: authEndpoints.SIGNUP,
        method: "POST",
        body: userData,
      }),
    }),

    verifyEmail: builder.mutation({
      query: (verificationData) => ({
        url: authEndpoints.VERIFY_EMAIL,
        method: "POST",
        body: verificationData,
      }),
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: authEndpoints.FORGOT_PASSWORD,
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: authEndpoints.RESET_PASSWORD,
        method: "POST",
        body: resetData,
      }),
    }),

    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: authEndpoints.REFRESH_TOKEN,
        method: "POST",
        body: { refreshToken },
      }),
    }),

    getProfile: builder.query({
      query: () => ({
        url: authEndpoints.PROFILE,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: authEndpoints.LOGOUT,
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = authApi;

// Export the reducer directly from authApi
export const apiReducer = authApi.reducer;
