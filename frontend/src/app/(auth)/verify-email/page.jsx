// frontend/src/app/(auth)/verify-email/page.jsx
"use client";

import { motion } from "framer-motion";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { VerifyEmailHeader } from "@/components/auth/verify-email/verify-email-header";
import { WelcomeSection } from "@/components/auth/verify-email/welcome-section";
import { SuccessState } from "@/components/auth/verify-email/success-state";
import { VerificationForm } from "@/components/auth/verify-email/verification-form";
import { HelpText } from "@/components/auth/verify-email/help-text";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";
import { AuthErrorAlert } from "@/components/auth/forms/auth-error-alert";
import { verifyEmailSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import VerifyEmailLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
import { PublicGuard } from "@/components/auth/guards/public-guard";

export default function VerifyEmailPage() {
  const {
    timeLeft,
    isLoading,
    error,
    handleVerifySubmit,
    handleResendCode,
    formatTime,
  } = useVerifyEmail();

  const isLoadingPage = useSimulatedLoading(0);

  if (isLoadingPage) {
    return <VerifyEmailLoading />;
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
            <VerifyEmailHeader variants={itemVariants} />

            <WelcomeSection variants={itemVariants} />

            <AuthFormProvider
              schema={verifyEmailSchema}
              defaultValues={{
                verificationCode: Array(6).fill(""),
              }}
              onSubmit={handleVerifySubmit}
              className="space-y-6"
            >
              <AuthErrorAlert error={error} />

              <VerificationForm
                variants={itemVariants}
                isLoading={isLoading}
                timeLeft={timeLeft}
                onResendCode={handleResendCode}
                formatTime={formatTime}
              />
            </AuthFormProvider>

            <HelpText variants={itemVariants} />
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </PublicGuard>
  );
}
