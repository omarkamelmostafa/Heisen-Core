// frontend/src/app/(auth)/verify-email/page.jsx
"use client";


import { motion } from "framer-motion";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { VerifyEmailHeader } from "@/features/auth/components/verify-email/verify-email-header";
import { WelcomeSection } from "@/features/auth/components/verify-email/welcome-section";
import { SuccessState } from "@/features/auth/components/verify-email/success-state";
import { VerificationForm } from "@/features/auth/components/verify-email/verification-form";
import { HelpText } from "@/features/auth/components/verify-email/help-text";
import { AuthFormProvider } from "@/features/auth/components/forms/auth-form-provider";
import { AuthErrorAlert } from "@/features/auth/components/forms/auth-error-alert";
import { verifyEmailSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import VerifyEmailLoading from "./loading";
import { ProductionErrorTrigger } from "@/features/auth/components/error/production-error-trigger";
import { PublicGuard } from "@/features/auth/components/guards/public-guard";

export default function VerifyEmailPage() {
  const {
    email,
    hasEmail,
    timeLeft,
    isLoading,
    error,
    handleVerifySubmit,
    handleResendCode,
    formatTime,
  } = useVerifyEmail();

  const router = useRouter();
  const isLoadingPage = useSimulatedLoading(0);

  // Guard: If no email context, redirect to login
  useEffect(() => {
    if (!hasEmail && !isLoadingPage) {
      router.push("/login");
    }
  }, [hasEmail, isLoadingPage, router]);

  if (isLoadingPage || !hasEmail) {
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

            <WelcomeSection variants={itemVariants} email={email} />

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
