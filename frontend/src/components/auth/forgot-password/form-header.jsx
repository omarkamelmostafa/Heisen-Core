// frontend/src/components/auth/forgot-password/form-header.jsx
import { motion } from "framer-motion";
import { forgotPasswordContent as content } from "@/lib/config/auth/forgot-password";

export function FormHeader({ variants }) {

  return (
    <motion.div variants={variants}>
      <h2 className="mb-1.5 text-2xl font-semibold">{content.header.title}</h2>
      <p className="text-muted-foreground">{content.header.subtitle}</p>
    </motion.div>
  );
}
