// frontend/src/features/auth/components/reset-password/reset-password-form.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FormField } from "@/features/auth/components/forms/form-field";
import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
import { PasswordStrengthMeter } from "@/features/auth/components/shared/password-strength-meter";
import { PasswordMatchIndicator } from "@/features/auth/components/shared/password-match-indicator";
import { HelpText } from "./help-text";
import { BackToLoginLink } from "./back-to-login-link";
import { useFormContext } from "react-hook-form";

export function ResetPasswordForm({
  variants,
  showPassword,
  showConfirmPassword,
  isLoading,
  onTogglePassword,
  onToggleConfirmPassword,
}) {
  const t = useTranslations("auth.resetPassword");
  const { watch } = useFormContext();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-4">
        <FormField
          name="password"
          type={showPassword ? "text" : "password"}
          label={t("form.passwordLabel")}
          placeholder={t("form.passwordPlaceholder")}
          required
          disabled={isLoading}
          minLength={6}
          maxLength={20}
          showPasswordToggle={true}
          onTogglePassword={onTogglePassword}
        />

        <FormField
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label={t("form.confirmPasswordLabel")}
          placeholder={t("form.confirmPasswordPlaceholder")}
          required
          disabled={isLoading}
          minLength={6}
          maxLength={20}
          showPasswordToggle={true}
          onTogglePassword={onToggleConfirmPassword}
        />

        {/* Enhanced Password Strength */}
        <PasswordStrengthMeter password={password} className="mt-2" />

        {/* Enhanced Password Match */}
        <PasswordMatchIndicator
          password={password}
          confirmPassword={confirmPassword}
          className="mt-2"
        />

        <AuthSubmitButtons.ResetPassword
          isLoading={isLoading}
          buttonText={t("actions.resetPassword")}
          loadingText={t("actions.resetting")}
        />
      </div>

      <HelpText />
      <BackToLoginLink />
    </motion.div>
  );
}
