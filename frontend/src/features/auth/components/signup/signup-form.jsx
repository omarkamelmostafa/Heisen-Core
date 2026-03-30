// frontend/src/features/auth/components/signup/signup-form.jsx
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FormField } from "@/features/auth/components/forms/form-field";
import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
import { NameFields } from "./name-fields";
import { PasswordFields } from "./password-fields";
import { PasswordStrengthMeter } from "@/features/auth/components/shared/password-strength-meter";
import { PasswordMatchIndicator } from "@/features/auth/components/shared/password-match-indicator";
import { TermsAndConditions } from "./terms-and-conditions";
import { SignupOptions } from "./signup-options";
import { useFormContext } from "react-hook-form";

export function SignupForm({
  variants,
  showPassword,
  showConfirmPassword,
  isLoading,
  onTogglePassword,
  onToggleConfirmPassword,
}) {
  const t = useTranslations("auth.signup");
  const { watch } = useFormContext();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-4">
        <NameFields isLoading={isLoading} />

        <FormField
          name="email"
          type="email"
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          required
          disabled={isLoading}
        />

        <PasswordFields
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          isLoading={isLoading}
          onTogglePassword={onTogglePassword}
          onToggleConfirmPassword={onToggleConfirmPassword}
        />

        <PasswordStrengthMeter password={password} className="mt-2" />

        <PasswordMatchIndicator
          password={password}
          confirmPassword={confirmPassword}
          className="mt-2"
        />

        <TermsAndConditions isLoading={isLoading} />

        <AuthSubmitButtons.Signup
          isLoading={isLoading}
          buttonText={t("submitButton")}
          loadingText={t("submitting")}
        />
      </div>

      <SignupOptions />
    </motion.div>
  );
}
