// components/auth/shared/password-strength-meter.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";

// Password validation rules (exported for use in forms)
export const PASSWORD_RULES = {
  minLength: 6,
  maxLength: 20,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

// Special characters pattern
export const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

/**
 * Validates password against rules and returns detailed results
 */
export const validatePassword = (password) => {
  const rules = PASSWORD_RULES;
  const validations = {
    length:
      password.length >= rules.minLength && password.length <= rules.maxLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    specialChars: SPECIAL_CHARS.test(password),
  };

  const passedRules = Object.values(validations).filter(Boolean).length;
  const totalRules = Object.keys(validations).length;
  const strength = Math.round((passedRules / totalRules) * 100);

  // Determine strength level
  let strengthLevel = "very-weak";
  let strengthColor = "bg-red-500";
  let strengthText = "Very Weak";

  if (strength >= 80) {
    strengthLevel = "very-strong";
    strengthColor = "bg-emerald-500";
    strengthText = "Very Strong";
  } else if (strength >= 60) {
    strengthLevel = "strong";
    strengthColor = "bg-green-500";
    strengthText = "Strong";
  } else if (strength >= 40) {
    strengthLevel = "medium";
    strengthColor = "bg-yellow-500";
    strengthText = "Medium";
  } else if (strength >= 20) {
    strengthLevel = "weak";
    strengthColor = "bg-orange-500";
    strengthText = "Weak";
  }

  return {
    strength,
    strengthLevel,
    strengthColor,
    strengthText,
    validations,
    isValid: Object.values(validations).every(Boolean),
  };
};

/**
 * Reusable Password Strength Meter Component
 */
export function PasswordStrengthMeter({
  password,
  className = "",
  showRequirements = true,
  showStrengthBar = true,
}) {
  if (!password) return null;

  const { strength, strengthLevel, strengthColor, strengthText, validations } =
    validatePassword(password);

  const validationItems = [
    {
      label: `Length between ${PASSWORD_RULES.minLength}-${PASSWORD_RULES.maxLength} characters`,
      isValid: validations.length,
      key: "length",
    },
    {
      label: "At least one uppercase letter (A-Z)",
      isValid: validations.uppercase,
      key: "uppercase",
    },
    {
      label: "At least one lowercase letter (a-z)",
      isValid: validations.lowercase,
      key: "lowercase",
    },
    {
      label: "At least one number (0-9)",
      isValid: validations.numbers,
      key: "numbers",
    },
    {
      label: "At least one special character (!@#$% etc.)",
      isValid: validations.specialChars,
      key: "specialChars",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={`space-y-3 ${className}`}
    >
      {/* Strength Indicator */}
      {showStrengthBar && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              Password Strength:
            </span>
            <span
              className={`font-semibold ${
                strengthLevel === "very-strong"
                  ? "text-emerald-600"
                  : strengthLevel === "strong"
                  ? "text-green-600"
                  : strengthLevel === "medium"
                  ? "text-yellow-600"
                  : strengthLevel === "weak"
                  ? "text-orange-600"
                  : "text-red-600"
              }`}
            >
              {strengthText}
            </span>
          </div>

          {/* Strength Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${strength}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-2 rounded-full ${strengthColor} transition-colors duration-300`}
            />
          </div>
        </div>
      )}

      {/* Requirements List */}
      {showRequirements && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <p className="text-xs font-medium text-muted-foreground">
            Password Requirements:
          </p>
          <div className="space-y-1.5">
            <AnimatePresence>
              {validationItems.map((item) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  {item.isValid ? (
                    <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-red-500 flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      item.isValid
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Warning for very weak passwords */}
      {strengthLevel === "very-weak" && password.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md"
        >
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span className="text-xs text-red-700 dark:text-red-300 font-medium">
            Your password is very weak. Please follow the requirements above.
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
