// frontend/src/features/auth/components/signup/signup-options.jsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { useTranslations } from "next-intl";

export function SignupOptions() {
  const t = useTranslations("auth.signup");

  return (
    <motion.p
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="text-muted-foreground text-center text-sm"
    >
      {t("hasAccount")}{" "}
      <Link
        href="/login"
        className="text-foreground hover:underline font-medium"
      >
        {t("signInLink")}
      </Link>
    </motion.p>
  );
}
