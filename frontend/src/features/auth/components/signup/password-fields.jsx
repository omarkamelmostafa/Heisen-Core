// frontend/src/features/auth/components/signup/password-fields.jsx
"use client";

import { FormField } from "@/features/auth/components/forms/form-field";
import { useTranslations } from "next-intl";

export function PasswordFields({
  showPassword,
  showConfirmPassword,
  isLoading,
  onTogglePassword,
  onToggleConfirmPassword,
}) {
  const t = useTranslations("auth.signup");

  return (
    <>
      <FormField
        name="password"
        type={showPassword ? "text" : "password"}
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        required
        disabled={isLoading}
        showPasswordToggle={true}
        onTogglePassword={onTogglePassword}
      />

      <FormField
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        label={t("confirmPasswordLabel")}
        placeholder={t("confirmPasswordPlaceholder")}
        required
        disabled={isLoading}
        showPasswordToggle={true}
        onTogglePassword={onToggleConfirmPassword}
      />
    </>
  );
}
