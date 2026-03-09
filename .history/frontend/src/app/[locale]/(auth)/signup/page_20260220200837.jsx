// frontend/src/app/(auth)/signup/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { registerUser } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/store/slices/auth/auth-selectors";
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

export default function SignupPage() {
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const router = useRouter();
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isLoadingPage = useSimulatedLoading(0);

  // Stable toggle functions
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Clear any stale auth error on mount
  useEffect(() => {
    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After successful signup, direct user to verify-email flow
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/verify-email");
    }
  }, [isAuthenticated, router]);

  const handleSignupSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      // Redirect handled by useEffect when isAuthenticated becomes true
    } catch (error) {
      // Error is stored in Redux and displayed below
      console.error("Signup error:", error);
    }
  };

  if (isLoadingPage) {
    return <SignupLoading />;
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
              onSubmit={handleSignupSubmit}
              className="space-y-6"
            >
              <AuthErrorAlert />

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
    </>
  );
}
