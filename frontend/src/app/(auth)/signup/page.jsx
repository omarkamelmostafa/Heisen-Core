// frontend/src/app/(auth)/signup/page.jsx
"use client";

import { useState } from "react";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { useSignup } from "@/features/auth/hooks/useSignup";
import { SignupHeader } from "@/components/auth/signup/signup-header";
import { WelcomeSection } from "@/components/auth/signup/welcome-section";
import { SignupForm } from "@/components/auth/signup/signup-form";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";
import { AuthErrorAlert } from "@/components/auth/forms/auth-error-alert";
import { signupSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { motion } from "framer-motion";
import SignupLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
import { PublicGuard } from "@/components/auth/guards/public-guard";

export default function SignupPage() {
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const {
    isLoading,
    error,
    handleSignup,
  } = useSignup();

  const isLoadingPage = useSimulatedLoading(0);

  // Stable toggle functions
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoadingPage) {
    return <SignupLoading />;
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
            <SignupHeader variants={itemVariants} />

            <WelcomeSection variants={itemVariants} />

            <AuthFormProvider
              schema={signupSchema}
              defaultValues={{
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                terms: false,
              }}
              onSubmit={handleSignup}
              className="space-y-6"
            >
              <AuthErrorAlert error={error} />

              <SignupForm
                variants={itemVariants}
                showPassword={passwordVisibility.password}
                showConfirmPassword={passwordVisibility.confirmPassword}
                isLoading={isLoading}
                onTogglePassword={() => togglePasswordVisibility("password")}
                onToggleConfirmPassword={() =>
                  togglePasswordVisibility("confirmPassword")
                }
              />
            </AuthFormProvider>
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </PublicGuard>
  );
}
