// frontend/src/features/auth/components/forgot-password/help-text.jsx
import { motion } from "framer-motion";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { forgotPasswordContent as content } from "@/lib/config/auth/forgot-password";

export function HelpText() {

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="bg-muted rounded-lg p-3 text-sm"
    >
      <p className="text-muted-foreground">{content.helpText.content}</p>
    </motion.div>
  );
}
