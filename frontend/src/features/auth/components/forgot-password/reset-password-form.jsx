// frontend/src/features/auth/components/forgot-password/reset-password-form.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FormField } from "@/features/auth/components/forms/form-field";
import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
import { HelpText } from "./help-text";
import { BackToLoginLink } from "./back-to-login-link";
import { useFormContext } from "react-hook-form";

export function ResetPasswordForm({ variants, isLoading }) {
  const t = useTranslations("auth.forgotPassword");
  const { watch } = useFormContext();

  const email = watch("userEmail");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-4">
        <FormField
          name="userEmail"
          type="email"
          label={t("form.emailLabel")}
          placeholder={t("form.emailPlaceholder")}
          required
          disabled={isLoading}
        />

        <HelpText />

        <AuthSubmitButtons.ForgotPassword
          isLoading={isLoading}
          email={email}
          buttonText={t("actions.sendResetLink")}
          loadingText={t("actions.sending")}
        />
      </div>

      <BackToLoginLink />
    </motion.div>
  );
}
