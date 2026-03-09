export const verifyEmailContent = {
  appName: "Fantasy Coach",
  header: {
    title: "Verify Your Email",
    subtitle:
      "We've sent a 6-digit verification code to your email address.",
  },
  form: {
    verificationCode: {
      label: "Verification Code",
      length: 6,
      icon: "verified",
    },
  },
  help: {
    title: "Need help?",
    items: [
      "Check your spam or junk folder",
      "Make sure you entered the correct email address",
      "The code will expire in 5 minutes",
      "Contact support if you continue having issues",
    ],
  },
  timer: {
    expiresIn: "Code expires in:",
    resendAvailable: "Resend Code",
    resendCountdown: "Resend Code ({time})",
  },
  resend: {
    prompt: "Didn't receive the code?",
    button: "Resend Code",
    countdown: "Resend Code ({time})",
  },
  success: {
    title: "Email Verified!",
    message:
      "Your email has been successfully verified. Your account is now active and ready to use.",
    redirect: "Redirecting you to the dashboard...",
  },
  actions: {
    verify: "Verify Email",
    verifying: "Verifying...",
    backToLogin: "Back to Login",
    icon: "confirmed",
  },
  links: {
    backToLogin: "Back to Login",
  },
};

export const verifyEmailLayoutContent = {
  title: "Almost Game Time!",
  description:
    "The final step before you enter the arena! We've sent a verification link to your inbox - click it to activate your account and unlock the door to unlimited fantasy coaching possibilities and competitive glory.",
  cardTitle: "Verify & Enter The Game",
  cardDescription:
    "Complete your verification to gain full access to our fantasy coaching ecosystem, including real-time updates, player insights, and strategic tools designed for winners.",
  cardIcon: "security",
};
