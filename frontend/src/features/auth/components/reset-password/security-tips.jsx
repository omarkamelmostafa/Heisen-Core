// frontend/src/features/auth/components/reset-password/security-tips.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";

export function SecurityTips() {
  const t = useTranslations("auth.resetPassword");
  const items = t.raw("securityTips.items");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="bg-muted rounded-lg p-4 text-sm text-left"
    >
      <p className="font-medium text-foreground mb-2">
        {t("securityTips.title")}
      </p>
      <ul className="space-y-1 text-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </motion.div>
  );
}
