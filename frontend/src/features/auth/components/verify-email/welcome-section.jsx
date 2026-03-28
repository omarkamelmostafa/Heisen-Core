// frontend/src/features/auth/components/verify-email/welcome-section.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function WelcomeSection({ variants, email }) {
  const t = useTranslations("auth.verifyEmail");

  return (
    <motion.div variants={variants}>
      <h2 className="mb-1.5 text-2xl font-semibold">{t("header.title")}</h2>
      <p className="text-muted-foreground">
        {t("header.subtitle")}
        {email && (
          <span className="block mt-1 font-medium text-foreground">
            {email}
          </span>
        )}
      </p>
    </motion.div>
  );
}
