// frontend/src/features/auth/hooks/useSignup.js
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { registerUser } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { NotificationService } from "@/lib/notifications/notify";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectAuthError,
} from "@/store/slices/auth/auth-selectors";
import { selectUserProfile } from "@/store/slices/user";

export function useSignup() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations("toasts");

  const user = useAppSelector(selectUserProfile);
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
        NotificationService.success(t("accountCreated"), {
          description: t("accountCreatedCheckEmail"),
        });
        // Redirect to check email page on success with timer enabled
        router.push(
          `/verify-email?email=${encodeURIComponent(data.email)}&sent=${emailSent}`
        );
      } else {
        NotificationService.warn(
          t("accountCreatedEmailFailed"),
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
