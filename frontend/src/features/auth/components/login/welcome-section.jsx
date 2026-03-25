// frontend/src/features/auth/components/login/welcome-section.jsx
import { motion } from "framer-motion";
import { loginContent as content } from "@/lib/config/auth/login";

export function WelcomeSection({ variants }) {

  return (
    <motion.div variants={variants}>
      <h2 className="mb-1.5 text-2xl font-semibold">{content.header.title}</h2>
      <p className="text-muted-foreground">{content.header.subtitle}</p>
    </motion.div>
  );
}
