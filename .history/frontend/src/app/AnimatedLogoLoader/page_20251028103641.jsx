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
import { AnimatedLogoLoader } from "@/components/ui/animated-logo";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  return (
    <AnimatedLogoLoader />

  );
}