// frontend/src/components/auth/reset-password/success-message.jsx
import { motion } from "framer-motion";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";

export function SuccessMessage() {
  const content = useResetPasswordContent();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="space-y-3"
    >
      <h2 className="text-2xl font-semibold">{content.success.title}</h2>
      <p className="text-muted-foreground">{content.success.message}</p>
    </motion.div>
  );
}
