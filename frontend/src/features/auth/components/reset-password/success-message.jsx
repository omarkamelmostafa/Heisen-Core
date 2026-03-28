// frontend/src/features/auth/components/reset-password/success-message.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";

export function SuccessMessage() {
  const t = useTranslations("auth.resetPassword");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="space-y-3"
    >
      <h2 className="text-2xl font-semibold">{t("success.title")}</h2>
      <p className="text-muted-foreground">{t("success.message")}</p>
    </motion.div>
  );
}
