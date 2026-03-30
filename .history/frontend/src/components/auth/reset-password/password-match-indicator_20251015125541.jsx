// components/auth/reset-password/password-match-indicator.jsx
import { motion } from "framer-motion";

export function PasswordMatchIndicator({ password, confirmPassword }) {
  if (!confirmPassword) return null;

  const isMatch = password === confirmPassword;
  const color = isMatch ? "text-emerald-600" : "text-red-600";
  const message = isMatch ? "✓ Passwords match" : "✗ Passwords don't match";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-xs ${color}`}
    >
      {message}
    </motion.div>
  );
}
