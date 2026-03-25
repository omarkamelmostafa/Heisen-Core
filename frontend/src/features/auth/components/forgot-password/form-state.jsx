// frontend/src/features/auth/components/forgot-password/form-state.jsx
import { motion } from "framer-motion";
import { containerVariants } from "@/lib/animations/auth/authAnimations";
import { FormHeader } from "./form-header";
import { ResetPasswordForm } from "./reset-password-form";

export function FormState({ isLoading }) {
  return (
    <motion.div
      key="form"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <FormHeader variants={containerVariants} />
      <ResetPasswordForm variants={containerVariants} isLoading={isLoading} />
    </motion.div>
  );
}
