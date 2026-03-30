// frontend/src/features/auth/components/verify-email/verification-form.jsx

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { VerificationInput } from "./verification-input";
import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
import { TimerDisplay } from "./timer-display";
import { ResendCodeSection } from "./resend-code-section";
import { BackToLoginLink } from "./back-to-login-link";

export function VerificationForm({
  variants,
  isLoading,
  timeLeft,
  onResendCode,
  formatTime,
}) {
  const t = useTranslations("auth.verifyEmail");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-6">
        <VerificationInput
          label={t("form.verificationCodeLabel")}
          length={6}
          required
          disabled={isLoading}
        />

        <TimerDisplay timeLeft={timeLeft} formatTime={formatTime} />

        <AuthSubmitButtons.VerifyEmail
          isLoading={isLoading}
          buttonText={t("actions.verify")}
          loadingText={t("actions.verifying")}
        />
      </div>

      <ResendCodeSection
        timeLeft={timeLeft}
        formatTime={formatTime}
        onResendCode={onResendCode}
      />

      <BackToLoginLink />
    </motion.div>
  );
}

