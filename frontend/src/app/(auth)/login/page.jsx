// frontend/src/app/(auth)/login/page.jsx
"use client";

import { useState } from "react";
import { useTransitionReady } from "@/hooks/use-transition-ready";
import { LoginSkeleton } from "@/features/auth/components/skeletons/login-skeleton";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { TwoFactorStep } from "@/features/auth/components/login/two-factor-step";
import { LoginHeader } from "@/features/auth/components/login/login-header";
import { WelcomeSection } from "@/features/auth/components/login/welcome-section";
import { LoginForm } from "@/features/auth/components/login/login-form";
import { Divider } from "@/features/auth/components/login/divider";
import { AuthFormProvider } from "@/features/auth/components/forms/auth-form-provider";
import { AuthErrorAlert } from "@/features/auth/components/forms/auth-error-alert";
import { loginSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { motion } from "framer-motion";
import { ProductionErrorTrigger } from "@/features/auth/components/error/production-error-trigger";
import { PublicGuard } from "@/features/auth/components/guards/public-guard";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    isLoading,
    error,
    handleLogin,
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
  } = useLogin();

  const { isReady } = useTransitionReady({ delay: 300 });

  if (!isReady) {
    return <LoginSkeleton />;
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
            <LoginHeader variants={itemVariants} />
            <WelcomeSection variants={itemVariants} />

            {requiresTwoFactor ? (
              <TwoFactorStep
                onVerify={handleVerify2fa}
                onCancel={handleCancel2fa}
                onResend={handleResendCode}
                isVerifying={isVerifying}
                isResending={isResending}
              />
            ) : (
              <>
                <AuthFormProvider
                  schema={loginSchema}
                  defaultValues={{
                    email: "",
                    password: "",
                    rememberMe: false,
                  }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  <Divider variants={itemVariants} />

                  {isVerified && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 border border-green-200">
                      Your email has been verified. You can now log in.
                    </div>
                  )}
                  {isReset && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 border border-green-200">
                      Your password has been successfully reset. Please log in.
                    </div>
                  )}

                  {isEmailChanged && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        Email updated successfully. Please log in with your new address.
                      </p>
                    </div>
                  )}

                  {isEmailTokenInvalid && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        This confirmation link is invalid or has expired. Please request a new
                        one from your account settings.
                      </p>
                    </div>
                  )}

                  {isEmailTaken && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-800">
                        Your new email was already taken by another account by the time you
                        confirmed. Please try a different address.
                      </p>
                    </div>
                  )}

                  <AuthErrorAlert error={error} />

                  <LoginForm
                    variants={itemVariants}
                    showPassword={showPassword}
                    isLoading={isLoading}
                    onTogglePassword={() => setShowPassword((prev) => !prev)}
                  />
                </AuthFormProvider>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </PublicGuard>
  );
}