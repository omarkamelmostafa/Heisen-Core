// frontend/src/components/auth/verify-email/verification-form.jsx

import { motion } from "framer-motion";
import { VerificationInput } from "./verification-input";
import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
import { TimerDisplay } from "./timer-display";
import { ResendCodeSection } from "./resend-code-section";
import { BackToLoginLink } from "./back-to-login-link";
import { verifyEmailContent as content } from "@/lib/config/auth/verify-email";

export function VerificationForm({
  variants,
  isLoading,
  timeLeft,
  onResendCode,
  formatTime,
}) {

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-6">
        <VerificationInput
          label={content.form.verificationCode.label}
          length={content.form.verificationCode.length}
          required
          disabled={isLoading}
        />

        <TimerDisplay timeLeft={timeLeft} formatTime={formatTime} />

        <AuthSubmitButtons.VerifyEmail
          isLoading={isLoading}
          buttonText={content.actions.verify}
          loadingText={content.actions.verifying}
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

