// frontend/src/features/auth/components/login/login-options.jsx
"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function LoginOptions({ isLoading }) {
  const t = useTranslations("auth.login");
  const { setValue, watch } = useFormContext();

  const rememberMe = watch("rememberMe") || false;

  const handleRememberMeChange = (checked) => {
    setValue("rememberMe", checked, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={quickFadeInVariants}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            disabled={isLoading}
            checked={rememberMe}
            onCheckedChange={handleRememberMeChange}
          />
          <Label
            htmlFor="rememberMe"
            className="text-sm font-normal text-muted-foreground cursor-pointer"
          >
            {t("rememberMe")}
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          {t("forgotPassword")}
        </Link>
      </motion.div>

      <motion.p
        initial="hidden"
        animate="visible"
        variants={quickFadeInVariants}
        className="text-muted-foreground text-center text-sm"
      >
        {t("noAccount")}{" "}
        <Link
          href="/signup"
          className="text-foreground hover:underline font-medium"
        >
          {t("signupLink")}
        </Link>
      </motion.p>
    </>
  );
}
