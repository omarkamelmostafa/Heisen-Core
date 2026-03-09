// components/auth/reset-password/form-state.jsx
import { motion } from "framer-motion";
import { containerVariants } from "@/lib/animations/auth/authAnimations";
import { FormHeader } from "./form-header";
import { ResetPasswordForm } from "./reset-password-form";
import { PasswordRequirements } from "./password-requirements";

export function FormState({
  showPassword,
  showConfirmPassword,
  isLoading,
  formData,
  onTogglePassword,
  onToggleConfirmPassword,
  onChange,
  onSubmit,
}) {
  return (
    <motion.div
      key="form"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <FormHeader variants={containerVariants} />

      <ResetPasswordForm
        variants={containerVariants}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        isLoading={isLoading}
        formData={formData}
        onTogglePassword={onTogglePassword}
        onToggleConfirmPassword={onToggleConfirmPassword}
        onChange={onChange}
        onSubmit={onSubmit}
      />

      <PasswordRequirements variants={containerVariants} />
    </motion.div>
  );
}
