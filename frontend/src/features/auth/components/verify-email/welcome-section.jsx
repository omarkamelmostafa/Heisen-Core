// frontend/src/components/auth/verify-email/welcome-section.jsx
import { motion } from "framer-motion";
import { verifyEmailContent as content } from "@/lib/config/auth/verify-email";

export function WelcomeSection({ variants, email }) {

  return (
    <motion.div variants={variants}>
      <h2 className="mb-1.5 text-2xl font-semibold">{content.header.title}</h2>
      <p className="text-muted-foreground">
        {content.header.subtitle}
        {email && (
          <span className="block mt-1 font-medium text-foreground">
            {email}
          </span>
        )}
      </p>
    </motion.div>
  );
}
