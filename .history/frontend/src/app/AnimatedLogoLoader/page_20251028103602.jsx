// fr

"use client";

import { useSimulatedLoading } from "@/hooks/use-loading-simulator";
import { LoginHeader } from "@/components/auth/login/login-header";
import { WelcomeSection } from "@/components/auth/login/welcome-section";
import { LoginForm } from "@/components/auth/login/login-form";
import { AuthProviders } from "@/components/auth/providers/auth-providers";
import { Divider } from "@/components/auth/login/divider";
import { AuthFormProvider } from "@/components/auth/forms/auth-form-provider";
import { loginSchema } from "@/lib/validations/auth-schemas";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { motion } from "framer-motion";
import LoginLoading from "./loading";
import { ProductionErrorTrigger } from "@/components/auth/error/production-error-trigger";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isLoadingPage = useSimulatedLoading(0);

  const handleLoginSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log("Login data:", data);
      // Your API call here
      // await loginUser(data);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPage) {
    return <LoginLoading />;
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
            // className="flex h-full w-full flex-col gap-6 sm:max-w-lg"
            className="flex w-full flex-col gap-6 sm:max-w-lg"
          >
            <LoginHeader variants={itemVariants} />
            <WelcomeSection variants={itemVariants} />

            <AuthFormProvider
              schema={loginSchema}
              defaultValues={{
                email: "",
                password: "",
                rememberMe: false,
              }}
              onSubmit={handleLoginSubmit}
              className="space-y-6"
            >
              <AuthProviders
                providers={["google", "facebook"]}
                disabledProviders={["google", "facebook"]}
                context="login"
                layout="horizontal"
                variants={itemVariants}
              />

              <Divider variants={itemVariants} />

              <LoginForm
                variants={itemVariants}
                showPassword={showPassword}
                isLoading={isLoading}
                onTogglePassword={() => setShowPassword((prev) => !prev)}
              />
            </AuthFormProvider>
          </motion.div>
        </motion.div>
      </div>
      <ProductionErrorTrigger />
    </>
  );
}