// frontend/src/components/auth/reset-password/password-requirements.jsx
import { motion } from "framer-motion";
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";

export function PasswordRequirements({ variants }) {

  return (
    <motion.div
      variants={variants}
      className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
    >
      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
        {content.requirements.title}
      </h3>
      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
        {content.requirements.items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </motion.div>
  );
}
