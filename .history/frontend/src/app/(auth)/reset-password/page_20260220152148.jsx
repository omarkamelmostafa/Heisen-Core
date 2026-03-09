// frontend/src/app/(auth)/reset-password/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ResetPasswordHeader } from "@/components/auth/reset-password/reset-password-header";
import { FormState } from "@/components/auth/reset-password/form-state";
import { SuccessState } from "@/components/auth/reset-password/success-state";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";
import { resetPasswordSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
} from "@/lib/animations/auth/authAnimations";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import ResetPasswordLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { resetPassword } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { selectAuthLoading } from "@/store/slices/auth/auth-selectors";
import { AuthErrorAlert } from "@/components/auth/forms/auth-error-alert";

export default function ResetPasswordPage() {
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const isLoadingPage = useSimulatedLoading(0);

  // Stable toggle functions
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

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
      setIsSuccess(true);
    } catch (err) {
      // Error already stored in Redux and displayed below
      console.error("Reset password error:", err);
    }
  };

  if (isLoadingPage) {
    return <ResetPasswordLoading />;
  }

  return (
    <>
      <div className="flex min-h-[100vh] items-center justify-center overflow-hidden">
        <motion.div
          {...motionProps.page}
          className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex w-full flex-col gap-6 sm:max-w-lg"
          >
            <ResetPasswordHeader />

            {!isSuccess ? (
              <AuthFormProvider
                schema={resetPasswordSchema}
                defaultValues={{
                  password: "",
                  confirmPassword: "",
                }}
                onSubmit={handleSubmit}
                mode="onTouched"
                reValidateMode="onChange"
              >
                <AuthErrorAlert />

                <FormState
                  showPassword={passwordVisibility.password}
                  showConfirmPassword={passwordVisibility.confirmPassword}
                  isLoading={isLoading}
                  onTogglePassword={() => togglePasswordVisibility("password")}
                  onToggleConfirmPassword={() =>
                    togglePasswordVisibility("confirmPassword")
                  }
                />
              </AuthFormProvider>
            ) : (
              <SuccessState />
            )}
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </>
  );
}
