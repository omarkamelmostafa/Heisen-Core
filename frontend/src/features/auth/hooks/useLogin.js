import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectAuthError,
  selectAuthUser,
} from "@/store/slices/auth/auth-selectors";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const error = useAppSelector(selectAuthError);

  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const isVerified = searchParams.get("verified") === "true";
  const isReset = searchParams.get("reset") === "true";

  // Redirect on successful login
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnTo);
    }
  }, [isAuthenticated, router, returnTo]);

  // Clear any stale error when component mounts
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleLogin = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      
      // CRITICAL: Login is not broadcast to other tabs. Session sync relies on middleware + HttpOnly cookie on next interaction.
      // Success handled by useEffect redirect above
    } catch (err) {
      // Error is stored in Redux state
      console.error("Login error:", err);
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    handleLogin,
    clearError: clearAuthError,
    returnTo,
    isVerified,
    isReset,
  };
}
