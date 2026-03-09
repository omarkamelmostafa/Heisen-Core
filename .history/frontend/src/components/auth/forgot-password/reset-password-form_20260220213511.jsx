// frontend/src/components/auth/forgot-password/reset-password-form.jsx
import { motion } from "framer-motion";
import { FormField } from "@/components/auth/forms/form-field";
import { AuthSubmitButtons } from "@/components/auth/forms/auth-submit-button";
import { HelpText } from "./help-text";
import { BackToLoginLink } from "./back-to-login-link";
import { forgotPasswordContent as content } from "@/lib/config/auth/forgot-password";
import { useFormContext } from "react-hook-form";

export function ResetPasswordForm({ variants, isLoading }) {
  const content = useForgotPasswordContent();
  const { watch } = useFormContext();

  const email = watch("userEmail");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-4">
        <FormField
          name="userEmail"
          type="email"
          label={content.form.email.label}
          placeholder={content.form.email.placeholder}
          required
          disabled={isLoading}
        />

        <HelpText />

        <AuthSubmitButtons.ForgotPassword
          isLoading={isLoading}
          email={email}
          buttonText={content.actions.sendResetLink}
          loadingText={content.actions.sending}
        />
      </div>

      <BackToLoginLink />
    </motion.div>
  );
}
