// frontend/src/features/auth/hooks/useResetPassword.js
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { resetPassword } from "@/store/slices/auth/auth-thunks";
import { clearError, setAuthError } from "@/store/slices/auth/auth-slice";
import { selectAuthLoading, selectAuthError } from "@/store/slices/auth/auth-selectors";

export function useResetPassword() {
  const [isSuccess, setIsSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // Clear any stale auth error on mount
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If no token is present, set an error so the user understands
  useEffect(() => {
    if (!token) {
      dispatch(
        setAuthError(
          "Password reset link is invalid or missing. Please request a new reset email."
        )
      );
    }
  }, [token, dispatch]);

  const handleSubmit = async (data) => {
    if (!token) {
      // Extra guard: don't attempt API call without token
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token,
          password: data.password,
        })
      ).unwrap();
      // On success, redirect to login
      router.push("/login?reset=true");
    } catch (err) {
      // Error already stored in Redux
      console.error("Reset password error:", err);
    }
  };

  return {
    isSuccess,
    isLoading,
    error,
    handleSubmit,
  };
}
