// frontend/src/features/auth/hooks/useLogin.js
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser, verify2fa, resend2fa } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { NotificationService } from "@/lib/notifications/notify";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectAuthError,
} from "@/store/slices/auth/auth-selectors";
import { selectUserProfile } from "@/store/slices/user";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const t = useTranslations("toasts");

  const user = useAppSelector(selectUserProfile);
  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const error = useAppSelector(selectAuthError);

  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const returnTo = searchParams.get("returnTo") || "/";
  const isVerified = searchParams.get("verified") === "true";
  const isReset = searchParams.get("reset") === "true";

  const reason = searchParams.get("reason");

  const isEmailChanged = reason === "email-changed";
  const isEmailTokenInvalid = reason === "email-token-invalid";
  const isEmailTaken = reason === "email-taken";

  // Redirect on successful login
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnTo);
    }
  }, [isAuthenticated, router, returnTo]);

  // Clear any stale error when component mounts & on unmount
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount & unmount

  const handleLogin = async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();

      if (result.data?.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setTempToken(result.data.tempToken);
        return;
      }

      NotificationService.success(
        t("welcomeBack", { name: result?.user?.firstName || "" })
      );

      sessionStorage.setItem('login_source', 'local');
      const channel = new BroadcastChannel('auth_channel');
      channel.postMessage('LOGIN');
      channel.close();
    } catch (err) {
      if (err.errorCode === "ACCOUNT_NOT_VERIFIED") {
        NotificationService.warn(t("verifyEmailBeforeLogin"));
        dispatch(clearError());
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      // Error is stored in Redux state
      console.error("Login error:", err);
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const handleVerify2fa = async (otpCode) => {
    setIsVerifying(true);
    try {
      await dispatch(verify2fa({ token: otpCode, tempToken })).unwrap();
      NotificationService.success(t("loginSuccessful"));
      sessionStorage.setItem("login_source", "true");
      const channel = new BroadcastChannel("auth_channel");
      channel.postMessage("LOGIN");
      channel.close();
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || t("verificationFailed"));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel2fa = () => {
    setRequiresTwoFactor(false);
    setTempToken(null);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await dispatch(resend2fa({ tempToken })).unwrap();
      NotificationService.success(t("newVerificationCodeSent"));
    } catch (error) {
      if (!error?.isGlobalError) {
        NotificationService.error(error?.message || t("failedToResendCode"));
      }
    } finally {
      setIsResending(false);
    }
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
    isEmailChanged,
    isEmailTokenInvalid,
    isEmailTaken,
    requiresTwoFactor,
    isVerifying,
    handleVerify2fa,
    handleCancel2fa,
    isResending,
    handleResendCode,
  };
}
