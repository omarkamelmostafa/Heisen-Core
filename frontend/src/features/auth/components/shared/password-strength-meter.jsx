// frontend/src/features/auth/components/shared/password-strength-meter.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Shield, Lock, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";

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

  // Calculate strength percentage - only 100% when ALL rules are passed
  const strength =
    passedRules === totalRules
      ? 100
      : Math.round((passedRules / totalRules) * 80);

  // Determine strength level - VERY STRONG only when ALL conditions are met
  let strengthLevel = "very-weak";
  let strengthColor = "bg-red-500";
  let strengthIcon = <Unlock className="h-4 w-4" />;

  if (passedRules === totalRules) {
    strengthLevel = "very-strong";
    strengthColor = "bg-emerald-500";
    strengthIcon = <Shield className="h-4 w-4" />;
  } else if (passedRules >= 4) {
    strengthLevel = "strong";
    strengthColor = "bg-green-500";
    strengthIcon = <Lock className="h-4 w-4" />;
  } else if (passedRules >= 3) {
    strengthLevel = "medium";
    strengthColor = "bg-yellow-500";
    strengthIcon = <Lock className="h-4 w-4" />;
  } else if (passedRules >= 1) {
    strengthLevel = "weak";
    strengthColor = "bg-orange-500";
    strengthIcon = <Unlock className="h-4 w-4" />;
  }

  return {
    strength,
    strengthLevel,
    strengthColor,
    strengthIcon,
    validations,
    passedRules,
    totalRules,
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
  const t = useTranslations("auth.passwordStrength");
  if (!password) return null;

  const {
    strength,
    strengthLevel,
    strengthColor,
    strengthIcon,
    validations,
    passedRules,
    totalRules,
  } = validatePassword(password);

  // Map strength level to translated text
  const strengthTextMap = {
    "very-weak": t("veryWeak"),
    "weak": t("weak"),
    "medium": t("medium"),
    "strong": t("strong"),
    "very-strong": t("veryStrong"),
  };
  const strengthText = strengthTextMap[strengthLevel] || t("veryWeak");

  const validationItems = [
    {
      label: t("lengthRequirement", { min: PASSWORD_RULES.minLength, max: PASSWORD_RULES.maxLength }),
      isValid: validations.length,
      key: "length",
    },
    {
      label: t("uppercaseRequirement"),
      isValid: validations.uppercase,
      key: "uppercase",
    },
    {
      label: t("lowercaseRequirement"),
      isValid: validations.lowercase,
      key: "lowercase",
    },
    {
      label: t("numberRequirement"),
      isValid: validations.numbers,
      key: "numbers",
    },
    {
      label: t("specialRequirement"),
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
            <div className="flex items-center gap-2">
              {strengthIcon}
              <span className="text-muted-foreground font-medium">
                {t("label")}
              </span>
            </div>
            <span
              className={`font-semibold ${strengthLevel === "very-strong"
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
              {strengthText} ({passedRules}/{totalRules})
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
            {t("requirements", { passedRules, totalRules })}
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
                    className={`text-xs ${item.isValid
                      ? "text-emerald-700 dark:text-emerald-400 font-medium"
                      : "text-muted-foreground"
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

      {/* Success message when all requirements are met */}
      {passedRules === totalRules && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md"
        >
          <Shield className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            {t("excellent")}
          </span>
        </motion.div>
      )}

      {/* Warning for incomplete passwords */}
      {passedRules > 0 && passedRules < totalRules && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md"
        >
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            {passedRules === totalRules - 1
              ? t("almostThere")
              : t("keepGoing", { remaining: totalRules - passedRules })}
          </span>
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
            {t("veryWeakAdvice")}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
