// frontend/src/features/auth/components/signup/terms-and-conditions.jsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function TermsAndConditions({ isLoading }) {
  const t = useTranslations("auth.signup");
  const {
    setValue,
    watch,
    formState: { errors, isSubmitted, isSubmitting },
    trigger,
  } = useFormContext();

  const termsValue = watch("terms") || false;
  const error = errors.terms;

  // Track if user has attempted submission
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Watch for form submission to show errors
  useEffect(() => {
    if (isSubmitted && error) {
      setHasAttemptedSubmit(true);
    }
  }, [isSubmitted, error]);

  const handleTermsChange = (checked) => {
    setValue("terms", checked, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // If user checks after failed submission, hide the error
    if (checked && hasAttemptedSubmit) {
      setHasAttemptedSubmit(false);
    }
  };

  // Show error if user has attempted to submit without checking terms
  const shouldShowError = (hasAttemptedSubmit || error) && !termsValue;

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          disabled={isLoading || isSubmitting}
          checked={termsValue}
          onCheckedChange={handleTermsChange}
          className={`mt-1 transition-colors ${shouldShowError ? "border-red-500 bg-red-50" : ""
            }`}
        />
        <Label
          htmlFor="terms"
          className="text-sm font-normal text-muted-foreground leading-relaxed cursor-pointer"
        >
          {t("termsAgree")}{" "}
          <Link
            href="/terms-of-service"
            className="text-primary hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("termsOfService")}
          </Link>{" "}
          {t("and")}{" "}
          <Link
            href="/privacy-policy"
            className="text-primary hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("privacyPolicy")}
          </Link>
        </Label>
      </div>

      {shouldShowError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
        >
          <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></div>
          <p className="text-sm text-red-700 font-medium">
            {t("termsRequired")}
          </p>
        </motion.div>
      )}
    </div>
  );
}
