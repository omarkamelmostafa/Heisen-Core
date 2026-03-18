// frontend/src/app/(auth)/forgot-password/page.jsx
"use client";

import { motion } from "framer-motion";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { ForgotPasswordHeader } from "@/features/auth/components/forgot-password/forgot-password-header";
import { FormState } from "@/features/auth/components/forgot-password/form-state";
import { SuccessState } from "@/features/auth/components/forgot-password/success-state";
import { AuthFormProvider } from "@/features/auth/components/forms/auth-form-provider";
import { forgotPasswordSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
} from "@/lib/animations/auth/authAnimations";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import ForgotPasswordLoading from "./loading";
import { ProductionErrorTrigger } from "@/features/auth/components/error/production-error-trigger";
import { AuthErrorAlert } from "@/features/auth/components/forms/auth-error-alert";

export default function ForgotPasswordPage() {
  const {
    isSuccess,
    submittedEmail,
    isLoading,
    error,
    handleSubmit,
    handleTryAnotherEmail,
  } = useForgotPassword();

  const isLoadingPage = useSimulatedLoading(0);

  if (isLoadingPage) {
    return <ForgotPasswordLoading />;
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
            <ForgotPasswordHeader />

            {!isSuccess ? (
              <AuthFormProvider
                schema={forgotPasswordSchema}
                defaultValues={{
                  userEmail: "",
                }}
                onSubmit={handleSubmit}
                mode="onTouched"
                reValidateMode="onChange"
              >
                <AuthErrorAlert error={error} />

                <FormState isLoading={isLoading} />
              </AuthFormProvider>
            ) : (
              <SuccessState
                email={submittedEmail}
                onTryAnotherEmail={handleTryAnotherEmail}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </>
  );
}
