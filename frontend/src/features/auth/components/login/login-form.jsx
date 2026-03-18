// frontend/src/components/auth/login/login-form.jsx

import { motion } from "framer-motion";
import { FormField } from "@/features/auth/components/forms/form-field";
import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
import { LoginOptions } from "./login-options";
import { loginContent as content } from "@/lib/config/auth/login";
import { useFormContext } from "react-hook-form";

export function LoginForm({
  variants,
  showPassword,
  isLoading,
  onTogglePassword,
}) {
  const { watch } = useFormContext();

  const email = watch("email");
  const password = watch("password");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-4">
        <FormField
          name="email"
          type="email"
          label={content.form.email.label}
          placeholder={content.form.email.placeholder}
          required
          disabled={isLoading}
        />

        <FormField
          name="password"
          type={showPassword ? "text" : "password"}
          label={content.form.password.label}
          placeholder={content.form.password.placeholder}
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
          buttonText={content.buttons.login}
          loadingText={content.buttons.loading}
        />
      </div>
    </motion.div>
  );
}
