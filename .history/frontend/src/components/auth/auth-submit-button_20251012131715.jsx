// components/auth/auth-submit-button.jsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  ArrowRight,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility

export function AuthSubmitButton({
  // Loading states
  isLoading = false,
  loadingText,
  defaultText,

  // Display states
  showSuccess = false,
  successText,

  // Validation
  disabled = false,
  disabledConditions = [],
  validateEmptyFields = [],
  validateCode = false,
  code = [],
  validatePasswordMatch = false,
  password = "",
  confirmPassword = "",
  minPasswordLength = 8,

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
  // Calculate disabled state based on multiple conditions
  const calculateDisabledState = () => {
    if (isLoading) return true;
    if (disabled) return true;

    // Check additional disabled conditions
    if (disabledConditions.some((condition) => condition)) return true;

    // Validate empty fields
    if (validateEmptyFields.length > 0) {
      const hasEmptyField = validateEmptyFields.some(
        (field) =>
          field === null ||
          field === undefined ||
          field.toString().trim() === ""
      );
      if (hasEmptyField) return true;
    }

    // Validate verification code
    if (
      validateCode &&
      code.some((digit) => !digit || digit.toString().trim() === "")
    ) {
      return true;
    }

    // Validate password match and length
    if (validatePasswordMatch) {
      if (!password || password.length < minPasswordLength) return true;
      if (password !== confirmPassword) return true;
    }

    return false;
  };

  const isDisabled = calculateDisabledState();

  // Get appropriate icon based on state
  const getIcon = () => {
    if (showSuccess && !isLoading) {
      return showSuccessIcon ? successIcon : null;
    }

    if (isLoading) {
      return showLoadingIcon ? loadingIcon : null;
    }

    if (showDefaultIcon) {
      return defaultIcon;
    }

    return null;
  };

  // Get button text based on state
  const getButtonText = () => {
    if (showSuccess && !isLoading) {
      return successText || defaultText;
    }

    if (isLoading) {
      return loadingText;
    }

    return defaultText;
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
      className={cn("transition-all duration-200", className)}
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
  Login: ({ isLoading, email, password, ...props }) => (
    <AuthSubmitButton
      isLoading={isLoading}
      loadingText="Signing in..."
      defaultText="Sign in to Fantasy Coach"
      validateEmptyFields={[email, password]}
      showDefaultIcon={true}
      defaultIcon={<ArrowRight className="w-4 h-4 mr-2" />}
      {...props}
    />
  ),

  // Signup button
  Signup: ({ isLoading, formData, ...props }) => (
    <AuthSubmitButton
      isLoading={isLoading}
      loadingText="Creating Account..."
      defaultText="Create Account"
      validateEmptyFields={[
        formData?.firstName,
        formData?.lastName,
        formData?.email,
        formData?.password,
        formData?.confirmPassword,
      ]}
      validatePasswordMatch={true}
      password={formData?.password}
      confirmPassword={formData?.confirmPassword}
      showDefaultIcon={true}
      defaultIcon={<User className="w-4 h-4 mr-2" />}
      {...props}
    />
  ),

  // Forgot Password button
  ForgotPassword: ({ isLoading, email, ...props }) => (
    <AuthSubmitButton
      isLoading={isLoading}
      loadingText="Sending Reset Link..."
      defaultText="Send Reset Link"
      validateEmptyFields={[email]}
      showDefaultIcon={true}
      defaultIcon={<Mail className="w-4 h-4 mr-2" />}
      {...props}
    />
  ),

  // Verify Email button
  VerifyEmail: ({ isLoading, code, ...props }) => (
    <AuthSubmitButton
      isLoading={isLoading}
      loadingText="Verifying..."
      defaultText="Verify Email"
      validateCode={true}
      code={code}
      showDefaultIcon={true}
      defaultIcon={<CheckCircle className="w-4 h-4 mr-2" />}
      {...props}
    />
  ),

  // Reset Password button
  ResetPassword: ({ isLoading, formData, ...props }) => (
    <AuthSubmitButton
      isLoading={isLoading}
      loadingText="Updating Password..."
      defaultText="Reset Password"
      validateEmptyFields={[formData?.password, formData?.confirmPassword]}
      validatePasswordMatch={true}
      password={formData?.password}
      confirmPassword={formData?.confirmPassword}
      showDefaultIcon={true}
      defaultIcon={<Lock className="w-4 h-4 mr-2" />}
      {...props}
    />
  ),

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

// Utility hook for managing submit button state
export function useAuthSubmitState(initialState = {}) {
  const [state, setState] = useState({
    isLoading: false,
    showSuccess: false,
    ...initialState,
  });

  const startLoading = () =>
    setState((prev) => ({ ...prev, isLoading: true, showSuccess: false }));
  const stopLoading = () => setState((prev) => ({ ...prev, isLoading: false }));
  const showSuccess = (successText = null) =>
    setState((prev) => ({
      ...prev,
      isLoading: false,
      showSuccess: true,
      successText,
    }));
  const resetState = () =>
    setState({ isLoading: false, showSuccess: false, successText: null });

  return {
    ...state,
    startLoading,
    stopLoading,
    showSuccess,
    resetState,
    setState,
  };
}

export default AuthSubmitButton;
// components/auth/auth-submit-button.jsx
// "use client";

// import { Button } from "@/components/ui/button";

// export function AuthSubmitButton({
//   isLoading = false,
//   loadingText,
//   defaultText,
//   disabled = false,
//   disabledConditions = [],
//   className = "w-full",
//   type = "submit",
//   variant = "default",
//   // Additional validation conditions beyond isLoading
//   validateEmptyFields = [],
//   // For verification code pages
//   validateCode = false,
//   code = [],
//   // For password confirmation
//   validatePasswordMatch = false,
//   password = "",
//   confirmPassword = "",
//   ...buttonProps
// }) {
//   // Calculate disabled state based on multiple conditions
//   const isDisabled = () => {
//     if (isLoading) return true;
//     if (disabled) return true;

//     // Check additional disabled conditions
//     if (disabledConditions.some((condition) => condition)) return true;

//     // Validate empty fields
//     if (validateEmptyFields.length > 0) {
//       if (validateEmptyFields.some((field) => !field || field.trim() === ""))
//         return true;
//     }

//     // Validate verification code
//     if (validateCode && code.some((digit) => digit === "")) return true;

//     // Validate password match
//     if (validatePasswordMatch && password !== confirmPassword) return true;

//     return false;
//   };

//   return (
//     <Button
//       type={type}
//       className={className}
//       disabled={isDisabled()}
//       variant={variant}
//       {...buttonProps}
//     >
//       {isLoading ? loadingText : defaultText}
//     </Button>
//   );
// }
