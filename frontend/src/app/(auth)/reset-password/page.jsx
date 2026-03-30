// frontend/src/app/(auth)/reset-password/page.jsx

"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import { ResetPasswordHeader } from "@/features/auth/components/reset-password/reset-password-header";
import { FormState } from "@/features/auth/components/reset-password/form-state";
import { SuccessState } from "@/features/auth/components/reset-password/success-state";
import { AuthFormProvider } from "@/features/auth/components/forms/auth-form-provider";
import { createResetPasswordSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
} from "@/lib/animations/auth/authAnimations";
import { useTransitionReady } from "@/hooks/use-transition-ready";
import { ResetPasswordSkeleton } from "@/features/auth/components/skeletons/reset-password-skeleton";
import { ProductionErrorTrigger } from "@/features/auth/components/error/production-error-trigger";
import { AuthErrorAlert } from "@/features/auth/components/forms/auth-error-alert";
import { PublicGuard } from "@/features/auth/components/guards/public-guard";

export default function ResetPasswordPage() {
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const tVal = useTranslations("validation");

  const resetPasswordSchema = useMemo(() => createResetPasswordSchema(tVal), [tVal]);

  const {
    isSuccess,
    isLoading,
    error,
    handleSubmit,
  } = useResetPassword();

  const { isReady } = useTransitionReady({ delay: 0 });

  if (!isReady) {
    return <ResetPasswordSkeleton />;
  }

  // Stable toggle functions
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

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
