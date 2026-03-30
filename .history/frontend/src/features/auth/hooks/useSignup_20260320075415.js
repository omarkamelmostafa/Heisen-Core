import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { registerUser } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { notify } from "@/lib/notify";
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
      const result = await dispatch(registerUser(data)).unwrap();
      const emailSent = result?.data?.emailSent !== false;

      if (emailSent) {
        notify.success("Account created successfully!", {
          description: "Check your email to verify your account.",
        });
        // Redirect to check email page on success with timer enabled
        router.push(
          `/verify-email?email=${encodeURIComponent(data.email)}&sent=true`
        );
      } else {
        notify.warning(
          "Account created, but we couldn't send the verification email. Please use Resend Code.",
          { id: "email-dispatch-warning", duration: 6000 }
        );
        // Redirect to check email page on success WITHOUT timer
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
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
