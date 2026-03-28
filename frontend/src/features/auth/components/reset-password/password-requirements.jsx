// frontend/src/features/auth/components/reset-password/password-requirements.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function PasswordRequirements({ variants }) {
  const t = useTranslations("auth.resetPassword");
  const items = t.raw("requirements.items");

  return (
    <motion.div
      variants={variants}
      className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
    >
      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
        {t("requirements.title")}
      </h3>
      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </motion.div>
  );
}
