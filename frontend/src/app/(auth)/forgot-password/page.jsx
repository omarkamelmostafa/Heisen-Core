// frontend/src/app/(auth)/forgot-password/page.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ForgotPasswordHeader } from "@/components/auth/forgot-password/forgot-password-header";
import { FormState } from "@/components/auth/forgot-password/form-state";
import { SuccessState } from "@/components/auth/forgot-password/success-state";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";
import { forgotPasswordSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
} from "@/lib/animations/auth/authAnimations";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import ForgotPasswordLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { forgotPassword } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { selectAuthLoading } from "@/store/slices/auth/auth-selectors";
import { AuthErrorAlert } from "@/components/auth/forms/auth-error-alert";

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);

  const isLoadingPage = useSimulatedLoading(0);

  // Clear any stale auth error on mount
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data) => {
    try {
      await dispatch(forgotPassword(data.userEmail)).unwrap();
      setSubmittedEmail(data.userEmail);
      setIsSuccess(true);
    } catch (err) {
      // Error is handled via Redux and shown below
      console.error("Forgot password error:", err);
    }
  };

  const handleTryAnotherEmail = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
  };

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
                <AuthErrorAlert />

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
