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

 
 
  return (
    iants}
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