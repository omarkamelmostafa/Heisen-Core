// frontend/src/app/(auth)/forgot-password/page.jsx
"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { ForgotPasswordHeader } from "@/features/auth/components/forgot-password/forgot-password-header";
import { FormState } from "@/features/auth/components/forgot-password/form-state";
import { SuccessState } from "@/features/auth/components/forgot-password/success-state";
import { AuthFormProvider } from "@/features/auth/components/forms/auth-form-provider";
import { createForgotPasswordSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
} from "@/lib/animations/auth/authAnimations";
import { useTransitionReady } from "@/hooks/use-transition-ready";
import { ForgotPasswordSkeleton } from "@/features/auth/components/skeletons/forgot-password-skeleton";
import { AuthErrorAlert } from "@/features/auth/components/forms/auth-error-alert";
import { ProductionErrorTrigger } from "@/features/auth/components/error/production-error-trigger";

export default function ForgotPasswordPage() {
  const tVal = useTranslations("validation");
  const forgotPasswordSchema = useMemo(() => createForgotPasswordSchema(tVal), [tVal]);

  const {
    isSuccess,
    submittedEmail,
    isLoading,
    error,
    handleSubmit,
    handleTryAnotherEmail,
  } = useForgotPassword();

  const { isReady } = useTransitionReady({ delay: 0 });

  if (!isReady) {
    return <ForgotPasswordSkeleton />;
  }

  return (
    <>
      <motion.div
        {...motionProps.page}
        className="flex flex-col gap-6"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex w-full flex-col gap-6"
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
      <ProductionErrorTrigger />
    </>
  );
}
