// frontend/src/components/auth/verify-email/welcome-section.jsx
import { motion } from "framer-motion";
import { verifyEmailContent as content } from "@/lib/config/auth/verify-email";

export function WelcomeSection({ variants }) {

  return (
    <motion.div variants={variants}>
      <h2 className="mb-1.5 text-2xl font-semibold">{content.header.title}</h2>
      <p className="text-muted-foreground">{content.header.subtitle}</p>
    </motion.div>
  );
}
