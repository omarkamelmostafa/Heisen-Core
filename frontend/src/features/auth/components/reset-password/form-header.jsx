// frontend/src/features/auth/components/reset-password/form-header.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function FormHeader({ variants }) {
  const t = useTranslations("auth.resetPassword");

  return (
    <motion.div variants={variants}>
      <h2 className="mb-1.5 text-2xl font-semibold">{t("form.title")}</h2>
      <p className="text-muted-foreground">{t("form.subtitle")}</p>
    </motion.div>
  );
}
