// frontend/src/features/auth/components/forgot-password/back-to-login-link.jsx
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";

export function BackToLoginLink() {
  const t = useTranslations("auth.forgotPassword");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="text-center"
    >
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t("links.backToLogin")}
      </Link>
    </motion.div>
  );
}
