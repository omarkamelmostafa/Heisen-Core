// frontend/src/features/auth/components/forgot-password/help-text.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";

export function HelpText() {
  const t = useTranslations("auth.forgotPassword");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="bg-muted rounded-lg p-3 text-sm"
    >
      <p className="text-muted-foreground">{t("helpText")}</p>
    </motion.div>
  );
}
