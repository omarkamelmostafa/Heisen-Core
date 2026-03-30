// frontend/src/features/auth/components/login/login-form.jsx

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FormField } from "@/features/auth/components/forms/form-field";
import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
import { LoginOptions } from "./login-options";
import { useFormContext } from "react-hook-form";
import { BRAND } from "@/lib/config/brand-config";

export function LoginForm({
  variants,
  showPassword,
  isLoading,
  onTogglePassword,
}) {
  const t = useTranslations("auth.login");
  const { watch } = useFormContext();

  const email = watch("email");
  const password = watch("password");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-4">
        <FormField
          name="email"
          type="email"
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          required
          disabled={isLoading}
        />

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

        <LoginOptions isLoading={isLoading} />

        <AuthSubmitButtons.Login
          isLoading={isLoading}
          email={email}
          password={password}
          buttonText={t("submitButton", { appName: BRAND.APP_NAME })}
          loadingText={t("submitting")}
        />
      </div>
    </motion.div>
  );
}
