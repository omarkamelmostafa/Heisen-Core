import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser, verify2fa } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { notify } from "@/lib/notify";
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

  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

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

      notify.success(
        `Welcome back${result?.user?.firstName ? ', ' + result.user.firstName : ''}!`
      );

      sessionStorage.setItem('login_source', 'local');
      const channel = new BroadcastChannel('auth_channel');
      channel.postMessage('LOGIN');
      channel.close();
    } catch (err) {
      if (err.errorCode === "ACCOUNT_NOT_VERIFIED") {
        notify.warning("Please verify your email before logging in.");
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
      notify.success("Login successful");
      sessionStorage.setItem("login_source", "true");
      const channel = new BroadcastChannel("auth_channel");
      channel.postMessage("LOGIN");
      channel.close();
    } catch (error) {
      if (!error?.isGlobalError) {
        notify.error(error?.message || "Verification failed");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel2fa = () => {
    setRequiresTwoFactor(false);
    setTempToken(null);
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
  };
}
