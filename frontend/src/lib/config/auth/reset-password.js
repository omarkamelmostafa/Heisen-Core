// frontend/src/lib/config/auth/reset-password.js
export const resetPasswordContent = {
  appName: "Fantasy Coach",
  header: {
    title: "Create New Password",
    subtitle:
      "Choose a strong, unique password to secure your Fantasy Coach account.",
  },
  form: {
    password: {
      label: "New Password",
      placeholder: "Create a strong password",
      icon: "password",
    },
    confirmPassword: {
      label: "Confirm New Password",
      placeholder: "Re-enter your new password",
      icon: "password",
    },
  },
  indicators: {
    strength: {
      label: "Password strength:",
      strong: "Strong",
      weak: "Weak",
    },
    match: {
      match: "✓ Passwords match",
      noMatch: "✗ Passwords don't match",
    },
  },
  requirements: {
    title: "Password Requirements:",
    items: [
      "At least 8 characters long",
      "Include uppercase and lowercase letters",
      "Include numbers and special characters",
      "Not used previously with this account",
    ],
  },
  securityTips: {
    title: "Security Tips:",
    items: [
      "Use a unique password for each service",
      "Enable two-factor authentication if available",
      "Regularly update your passwords",
      "Never share your password with anyone",
    ],
  },
  helpText: {
    content:
      "Make sure your new password is different from previous passwords.",
  },
  success: {
    title: "Password Updated!",
    message:
      "Your password has been successfully reset. You can now sign in with your new password.",
  },
  actions: {
    signIn: "Sign In Now",
    returnHome: "Return to Homepage",
    resetPassword: "Reset Password",
    resetting: "Resetting...",
    icon: "protection",
  },
  links: {
    backToLogin: "Remember your password? Sign in here",
  },
};

export const resetPasswordLayoutContent = {
  title: "Fortify Your Account!",
  description:
    "Create a powerful new password to secure your Fantasy Coach headquarters. A strong password ensures your strategies, team data, and competitive edge remain protected as you build toward championship success.",
  cardTitle: "Secure Your Coaching Legacy",
  cardDescription:
    "Choose a robust, memorable password that will safeguard your account, protect your fantasy investments, and keep your winning strategies secure from season to season.",
  cardIcon: "protection",
};
