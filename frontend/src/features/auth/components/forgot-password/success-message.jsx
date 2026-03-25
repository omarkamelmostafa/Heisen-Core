// frontend/src/features/auth/components/forgot-password/success-message.jsx
import { motion } from "framer-motion";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { forgotPasswordContent as content } from "@/lib/config/auth/forgot-password";

export function SuccessMessage({ email }) {

  const message = content.success.message.replace("{email}", email);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="space-y-3"
    >
      <h2 className="text-2xl font-semibold">{content.success.title}</h2>
      <p
        className="text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </motion.div>
  );
}
