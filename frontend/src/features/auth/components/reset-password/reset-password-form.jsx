// frontend/src/features/auth/components/reset-password/reset-password-form.jsx
import { motion } from "framer-motion";
import { FormField } from "@/features/auth/components/forms/form-field";
import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
import { PasswordStrengthMeter } from "@/features/auth/components/shared/password-strength-meter";
import { PasswordMatchIndicator } from "@/features/auth/components/shared/password-match-indicator";
import { HelpText } from "./help-text";
import { BackToLoginLink } from "./back-to-login-link";
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";
import { useFormContext } from "react-hook-form";

export function ResetPasswordForm({
  variants,
  showPassword,
  showConfirmPassword,
  isLoading,
  onTogglePassword,
  onToggleConfirmPassword,
}) {
  const { watch } = useFormContext();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-4">
        <FormField
          name="password"
          type={showPassword ? "text" : "password"}
          label={content.form.password.label}
          placeholder={content.form.password.placeholder}
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
          label={content.form.confirmPassword.label}
          placeholder={content.form.confirmPassword.placeholder}
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
          buttonText={content.actions.resetPassword}
          loadingText={content.actions.resetting}
        />
      </div>

      <HelpText />
      <BackToLoginLink />
    </motion.div>
  );
}

// import { motion } from "framer-motion";
// import { FormField } from "@/features/auth/components/forms/form-field";
// import { AuthSubmitButtons } from "@/features/auth/components/forms/auth-submit-button";
// import { PasswordStrengthMeter } from "@/features/auth/components/shared/password-strength-meter";
// import { PasswordMatchIndicator } from "@/features/auth/components/shared/password-match-indicator";
// import { HelpText } from "./help-text";
// import { BackToLoginLink } from "./back-to-login-link";
// import { useResetPasswordContent } from "@/lib/config/auth-content";

// export function ResetPasswordForm({
//   variants,
//   showPassword,
//   showConfirmPassword,
//   isLoading,
//   formData,
//   onTogglePassword,
//   onToggleConfirmPassword,
//   onChange,
//   onSubmit,
// }) {
//   const content = useResetPasswordContent();

//   return (
//     <motion.div variants={variants} className="space-y-4">
//       <form onSubmit={onSubmit} className="space-y-4">
//         <FormField
//           name="password"
//           type={showPassword ? "text" : "password"}
//           label={content.form.password.label}
//           placeholder={content.form.password.placeholder}
//           required
//           disabled={isLoading}
//           value={formData.password}
//           onChange={(e) => onChange("password")(e.target.value)}
//           minLength={6}
//           maxLength={20}
//           showPasswordToggle={true}
//           onTogglePassword={onTogglePassword}
//         />

//         <FormField
//           name="confirmPassword"
//           type={showConfirmPassword ? "text" : "password"}
//           label={content.form.confirmPassword.label}
//           placeholder={content.form.confirmPassword.placeholder}
//           required
//           disabled={isLoading}
//           value={formData.confirmPassword}
//           onChange={(e) => onChange("confirmPassword")(e.target.value)}
//           minLength={6}
//           maxLength={20}
//           showPasswordToggle={true}
//           onTogglePassword={onToggleConfirmPassword}
//         />

//         {/* Enhanced Password Strength */}
//         <PasswordStrengthMeter password={formData.password} className="mt-2" />

//         {/* Enhanced Password Match */}
//         <PasswordMatchIndicator
//           password={formData.password}
//           confirmPassword={formData.confirmPassword}
//           className="mt-2"
//         />

//         <AuthSubmitButtons.ResetPassword
//           isLoading={isLoading}
//           formData={formData}
//           buttonText={content.actions.resetPassword}
//           loadingText={content.actions.resetting}
//         />
//       </form>

//       <HelpText />
//       <BackToLoginLink />
//     </motion.div>
//   );
// }
