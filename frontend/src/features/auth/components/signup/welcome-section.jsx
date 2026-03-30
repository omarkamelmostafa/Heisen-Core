// frontend/src/features/auth/components/signup/welcome-section.jsx
"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BRAND } from "@/lib/config/brand-config";

export function WelcomeSection({ variants }) {

  const t = useTranslations("auth.signup");

  return (
    <motion.div variants={variants}>
      <h2 className="mb-1.5 text-2xl font-semibold">{t("title")}</h2>
      <p className="text-muted-foreground">{t("subtitle", { appName: BRAND.APP_NAME })}</p>
    </motion.div>
  );
}
