// components/auth/reset-password/password-strength-indicator.jsx
import { motion } from "framer-motion";

export function PasswordStrengthIndicator({ password }) {
  if (!password) return null;

  const strength = password.length >= 8 ? "Strong" : "Weak";
  const color = password.length >= 8 ? "text-emerald-600" : "text-amber-600";
  const barColor = password.length >= 8 ? "bg-emerald-500" : "bg-amber-500";
  const width = Math.min((password.length / 8) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-2"
    >
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={`${color} font-medium`}>{strength}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${barColor}`}
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </motion.div>
  );
}
