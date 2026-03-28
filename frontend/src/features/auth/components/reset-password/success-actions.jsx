// frontend/src/features/auth/components/reset-password/success-actions.jsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";

export function SuccessActions() {
  const t = useTranslations("auth.resetPassword");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="flex flex-col gap-3"
    >
      <Link href="/login" className="w-full">
        <Button className="w-full">{t("actions.signIn")}</Button>
      </Link>
      <Link href="/" className="w-full">
        <Button variant="outline" className="w-full">
          {t("actions.returnHome")}
        </Button>
      </Link>
    </motion.div>
  );
}
