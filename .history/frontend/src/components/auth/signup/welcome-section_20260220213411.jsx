// frontend/src/components/auth/signup/welcome-section.jsx
import { motion } from "framer-motion";
import { signupContent as content } from "@/lib/config/auth/signup";

export function WelcomeSection({ variants }) {
  const content = useSignupContent();

  return (
    <motion.div variants={variants}>
      <h2 className="mb-1.5 text-2xl font-semibold">{content.header.title}</h2>
      <p className="text-muted-foreground">{content.header.subtitle}</p>
    </motion.div>
  );
}
