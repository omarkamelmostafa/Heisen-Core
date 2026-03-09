// frontend/src/components/auth/reset-password/security-tips.jsx
import { motion } from "framer-motion";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";

export function SecurityTips() {
  const content = useResetPasswordContent();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="bg-muted rounded-lg p-4 text-sm text-left"
    >
      <p className="font-medium text-foreground mb-2">
        {content.securityTips.title}
      </p>
      <ul className="space-y-1 text-muted-foreground">
        {content.securityTips.items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </motion.div>
  );
}
