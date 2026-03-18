import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { verifyEmail as verifyEmailThunk } from "@/store/slices/auth/auth-thunks";
import { clearError, setAuthError } from "@/store/slices/auth/auth-slice";
import { notify } from "@/lib/notify";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectAuthError,
} from "@/store/slices/auth/auth-selectors";

export function useVerifyEmail() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const error = useAppSelector(selectAuthError);

  // Clear any stale error on mount
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const handleVerifySubmit = async (data) => {
    try {
      const code = data.verificationCode.join("");
      if (!code || code.length !== 6) {
        dispatch(setAuthError("Please enter the 6-digit verification code."));
        return;
      }

      await dispatch(
        verifyEmailThunk({
          token: code,
        })
      ).unwrap();
      // On success, redirect to login page with success state
      router.push("/login?verified=true");
    } catch (err) {
      console.error("Verification error:", err);
    }
  };

  const handleResendCode = async () => {
    try {
      console.log("Resending verification code...");
      // TODO: call backend resend endpoint when available
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTimeLeft(300); // Reset to 5 minutes
      setCanResend(false);
    } catch (err) {
      console.error("Resend error:", err);
      notify.error("Failed to resend verification code. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return {
    timeLeft,
    canResend,
    isLoading,
    isAuthenticated,
    error,
    handleVerifySubmit,
    handleResendCode,
    formatTime,
  };
}
