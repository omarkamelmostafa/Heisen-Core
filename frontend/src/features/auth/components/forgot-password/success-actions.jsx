// frontend/src/features/auth/components/forgot-password/success-actions.jsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";

export function SuccessActions({ onTryAnotherEmail }) {
  const t = useTranslations("auth.forgotPassword");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="flex flex-col gap-3"
    >
      <Button variant="outline" onClick={onTryAnotherEmail} className="w-full">
        {t("actions.tryAnotherEmail")}
      </Button>
      <Link href="/login" className="w-full">
        <Button variant="ghost" className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("actions.backToLogin")}
        </Button>
      </Link>
    </motion.div>
  );
}
