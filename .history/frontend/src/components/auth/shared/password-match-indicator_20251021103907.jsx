// comp
"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function PasswordMatchIndicator({
  password,
  confirmPassword,
  className = "",
}) {
  if (!confirmPassword) return null;

  const isMatch = password === confirmPassword && password.length > 0;
  const isFilled = confirmPassword.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      {isFilled && (
        <>
          {isMatch ? (
            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          ) : (
            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
          <span className={isMatch ? "text-emerald-600" : "text-red-600"}>
            {isMatch ? "Passwords match" : "Passwords do not match"}
          </span>
        </>
      )}
    </motion.div>
  );
}
