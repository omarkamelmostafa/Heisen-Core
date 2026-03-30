export const forgotPasswordContent = {
  appName: "Fantasy Coach",
  header: {
    title: "Reset Your Password",
    subtitle:
      "Enter your email address and we'll send you a link to reset your password.",
  },
  form: {
    email: {
      label: "Email address",
      placeholder: "Enter your email address",
      icon: "emailField",
    },
  },
  helpText: {
    content:
      "We'll send a secure reset link to your email. The link will expire in 1 hour for security.",
  },
  success: {
    title: "Check Your Email!",
    message:
      "We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to create a new password.",
    tips: {
      title: "Didn't receive the email?",
      items: [
        "Check your spam or junk folder",
        "Make sure you entered the correct email address",
        "Wait a few minutes and try again",
      ],
    },
  },
  actions: {
    tryAnotherEmail: "Try Another Email",
    backToLogin: "Back to Login",
    sendResetLink: "Send Reset Link",
    sending: "Sending...",
    icon: "reset",
  },
  links: {
    backToLogin: "Back to Login",
  },
};

export const forgotPasswordLayoutContent = {
  title: "Regain Your Access!",
  description:
    "Every champion faces obstacles - let's get you back in the game swiftly! Enter your email below and we'll send a secure password reset link that will have you back coaching your team in moments, not minutes.",
  cardTitle: "Swift Account Recovery",
  cardDescription:
    "If our email doesn't appear in your main inbox within a couple of minutes, please check your spam or promotions folder - we want you back in the action as quickly as possible.",
  cardIcon: "reset",
};
