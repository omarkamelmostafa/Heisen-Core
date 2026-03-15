// frontend/src/app/(auth)/reset-password/page.jsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
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
import { AuthErrorAlert } from "@/components/auth/forms/auth-error-alert";
import { PublicGuard } from "@/components/auth/guards/public-guard";

export default function ResetPasswordPage() {
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const {
    isSuccess,
    isLoading,
    error,
    handleSubmit,
  } = useResetPassword();

  const isLoadingPage = useSimulatedLoading(0);

  // Stable toggle functions
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoadingPage) {
    return <ResetPasswordLoading />;
  }

  return (
    <PublicGuard>
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
                <AuthErrorAlert error={error} />

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
    </PublicGuard>
  );
}
