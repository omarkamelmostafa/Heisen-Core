// app/(auth)/signup/page.jsx
"use client";

import { useSignupForm } from "@/hooks/auth/signup/use-signup-form";
import { useSimulatedLoading } from "@/hooks/use-loading-simulated";
import { SignupHeader } from "@/components/auth/signup/signup-header";
import { WelcomeSection } from "@/components/auth/signup/welcome-section";
import { SignupForm } from "@/components/auth/signup/signup-form";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { motion } from "framer-motion";
import SignupLoading from "./loading";

export default function SignupPage() {
  const {
    showPassword,
    showConfirmPassword,
    isLoading,
    formData,
    setShowPassword,
    setShowConfirmPassword,
    handleChange,
    handleSubmit,
  } = useSignupForm();

  const isLoadingPage = useSimulatedLoading(0);

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

          <SignupForm
            variants={itemVariants}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            isLoading={isLoading}
            formData={formData}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </motion.div>
      </motion.div>
    </div>
    </>
  );
}
