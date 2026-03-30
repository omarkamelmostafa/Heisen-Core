// frontend/src/features/auth/components/forms/auth-submit-button.jsx

"use client";

import { BRAND } from "@/lib/config/brand-config";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  ArrowRight,
  Mail,
  Lock,
  User,
  Shield,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function AuthSubmitButton({
  // Loading states
  isLoading = false,
  loadingText,
  defaultText,
  buttonText, // fallback alias for defaultText

  // Display states
  showSuccess = false,
  successText,

  // Validation - Now uses form context
  disabled = false,
  validateEmptyFields = [],
  validateCode = false,
  codeField = "verificationCode",
  validatePasswordMatch = false,
  passwordField = "password",
  confirmPasswordField = "confirmPassword",
  minPasswordLength = 6,

  // Styling
  className = "w-full",
  type = "submit",
  variant = "default",
  size = "default",

  // Icons
  showLoadingIcon = true,
  showSuccessIcon = true,
  showDefaultIcon = false,
  defaultIcon,
  loadingIcon = <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
  successIcon = <CheckCircle className="w-4 h-4 mr-2" />,

  // Button-specific props
  ...buttonProps
}) {
  const t = useTranslations("auth");
  const {
    formState: { errors, isValid, isSubmitting, isSubmitted },
  } = useFormContext();

  // Calculate disabled state based on multiple conditions
  const calculateDisabledState = () => {
    if (isLoading || isSubmitting) return true;
    if (disabled) return true;

    // Check if form has errors - this is the main validation
    if (Object.keys(errors).length > 0) return true;

    // Additional safety checks for specific scenarios
    if (validateCode) {
      const code = watch(codeField);
      if (
        code &&
        code.some((digit) => !digit || digit.toString().trim() === "")
      ) {
        return true;
      }
    }

    return false;
  };

  const isDisabled = calculateDisabledState();

  // Get appropriate icon based on state
  const getIcon = () => {
    if (showSuccess && !isLoading) {
      return showSuccessIcon ? successIcon : null;
    }

    if (isLoading || isSubmitting) {
      return showLoadingIcon ? loadingIcon : null;
    }

    if (showDefaultIcon) {
      return defaultIcon;
    }

    return null;
  };

  // Get button text based on state
  const resolvedDefaultText = defaultText || buttonText || t("buttons.login");
  const getButtonText = () => {
    if (showSuccess && !isLoading) {
      return successText || resolvedDefaultText;
    }

    if (isLoading || isSubmitting) {
      return loadingText || t("buttons.loggingIn");
    }

    return resolvedDefaultText;
  };

  // Get variant based on state
  const getVariant = () => {
    if (showSuccess && !isLoading) {
      return "default";
    }
    return variant;
  };

  return (
    <Button
      type={type}
      className={cn(
        "transition-all duration-200",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={isDisabled}
      variant={getVariant()}
      size={size}
      {...buttonProps}
    >
      {getIcon()}
      {getButtonText()}
    </Button>
  );
}

// Pre-configured buttons for common auth scenarios
export const AuthSubmitButtons = {
  // Login button
  Login: ({ isLoading, ...props }) => {
    const t = useTranslations("auth");
    return (
      <AuthSubmitButton
        isLoading={isLoading}
        loadingText={t("buttons.loggingIn")}
        defaultText={t("buttons.signInToApp", { appName: BRAND.APP_NAME })}
        showDefaultIcon={true}
        defaultIcon={<ArrowRight className="w-4 h-4 mr-2" />}
        {...props}
      />
    );
  },

  // Signup button
  Signup: ({ isLoading, ...props }) => {
    const t = useTranslations("auth");
    return (
      <AuthSubmitButton
        isLoading={isLoading}
        loadingText={t("buttons.creatingAccount")}
        defaultText={t("buttons.signup")}
        showDefaultIcon={true}
        defaultIcon={<User className="w-4 h-4 mr-2" />}
        {...props}
      />
    );
  },

  // Forgot Password button
  ForgotPassword: ({ isLoading, ...props }) => {
    const t = useTranslations("auth");
    return (
      <AuthSubmitButton
        isLoading={isLoading}
        loadingText={t("buttons.sendingResetLink")}
        defaultText={t("buttons.forgotPassword")}
        showDefaultIcon={true}
        defaultIcon={<Mail className="w-4 h-4 mr-2" />}
        {...props}
      />
    );
  },

  // Verify Email button
  VerifyEmail: ({ isLoading, ...props }) => {
    const t = useTranslations("auth");
    return (
      <AuthSubmitButton
        isLoading={isLoading}
        loadingText={t("buttons.verifying")}
        defaultText={t("buttons.verifyEmail")}
        showDefaultIcon={true}
        defaultIcon={<Shield className="w-4 h-4 mr-2" />}
        {...props}
      />
    );
  },

  // Reset Password button
  ResetPassword: ({ isLoading, ...props }) => {
    const t = useTranslations("auth");
    return (
      <AuthSubmitButton
        isLoading={isLoading}
        loadingText={t("buttons.updatingPassword")}
        defaultText={t("buttons.resetPassword")}
        showDefaultIcon={true}
        defaultIcon={<Lock className="w-4 h-4 mr-2" />}
        {...props}
      />
    );
  },

  // Generic success button
  Success: ({ successText, defaultText, ...props }) => (
    <AuthSubmitButton
      showSuccess={true}
      successText={successText}
      defaultText={defaultText}
      showSuccessIcon={true}
      {...props}
    />
  ),
};

export default AuthSubmitButton;
