// frontend/src/app/(auth)/verify-email/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { verifyEmail as verifyEmailThunk } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/store/slices/auth/auth-selectors";
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

export default function VerifyEmailPage() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isLoadingPage = useSimulatedLoading(0);

  // Clear any stale error on mount
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  // Redirect authenticated users away (e.g., to dashboard)
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = searchParams.get("returnUrl") || "/";
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleVerifySubmit = async (data) => {
    try {
      const code = data.verificationCode.join("");
      if (!code || code.length !== 6) {
        dispatch(setError("Please enter the 6-digit verification code."));
        return;
      }

      await dispatch(
        verifyEmailThunk({
          code,
        })
      ).unwrap();
      // On success, user becomes authenticated; redirect effect handles navigation
    } catch (err) {
      console.error("Verification error:", err);
    }
  };

  const handleResendCode = async () => {
    try {
      console.log("Resending verification code...");
      // TODO: call backend resend endpoint when available
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTimeLeft(300); // Reset to 5 minutes
      setCanResend(false);
    } catch (err) {
      console.error("Resend error:", err);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (isLoadingPage) {
    return <VerifyEmailLoading />;
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
              <AuthErrorAlert />

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
    </>
  );
}
