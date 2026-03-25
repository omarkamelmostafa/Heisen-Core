import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  verifyEmail as verifyEmailThunk,
  resendVerification,
} from "@/store/slices/auth/auth-thunks";
import { clearError, setAuthError } from "@/store/slices/auth/auth-slice";
import { NotificationService } from "@/lib/notifications/notify";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectAuthError,
  selectAuthUser,
} from "@/store/slices/auth/auth-selectors";

export function useVerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const error = useAppSelector(selectAuthError);

  const hasInitializedTimer = useRef(false);

  // Email source: URL search params > Redux state
  const emailFromUrl = searchParams.get("email");
  const email = emailFromUrl || user?.email;
  const hasEmail = !!email;

  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Clear any stale error on mount
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize timer from URL params on mount
  useEffect(() => {
    if (hasInitializedTimer.current) return;
    hasInitializedTimer.current = true;

    const sent = searchParams.get("sent");
    if (sent === "true" && email) {
      setTimeLeft(300);
      setCanResend(false);

      // Clean sent param from URL to prevent timer restart on refresh
      const params = new URLSearchParams(searchParams.toString());
      params.delete("sent");
      const query = params.toString();
      window.history.replaceState(null, '', `/verify-email${query ? '?' + query : ''}`);
    }
  }, [searchParams, email]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canResend) {
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
    if (!email) {
      NotificationService.error("No email address found. Please go back and try again.");
      return;
    }

    try {
      await dispatch(resendVerification(email)).unwrap();

      NotificationService.success("Verification code sent!", {
        description: `A new 6-digit code has been sent to ${email}.`,
      });

      setTimeLeft(300);
      setCanResend(false);
    } catch (err) {
      console.error("Resend error:", err);
      // Error notification is usually handled by thunk/middleware or locally
      if (err.errorCode === "RATE_LIMITED") {
        NotificationService.error("Too many attempts. Please wait a few minutes.");
      } else {
        NotificationService.error("Failed to resend verification code. Please try again.");
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return {
    email,
    hasEmail,
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
