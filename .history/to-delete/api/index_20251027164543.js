// frontend/src/store/slices/api/index.js

// Export RTK Query API and utilities
export { authApi } from "./api-slice";
export { apiReducer } from "./api-slice";

// Export hooks for convenient usage
export {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useLogoutMutation,
} from "./api-slice";

// If you still need traditional thunks, export them separately
export * from "./api-thunks";
