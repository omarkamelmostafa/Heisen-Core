import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { registerUser } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectAuthError,
  selectAuthUser,
} from "@/store/slices/auth/auth-selectors";

export function useSignup() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const error = useAppSelector(selectAuthError);

  // Clear any stale auth error on mount
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignup = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      // Redirect to check email page on success
      router.push("/verify-email");
    } catch (err) {
      // Error is stored in Redux and displayed below
      console.error("Signup error:", err);
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
    handleSignup,
    clearError: clearAuthError,
  };
}
