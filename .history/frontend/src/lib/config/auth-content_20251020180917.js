// lib/config/auth-content.js
export const authContent = {
  layout: {
    login: {
      title: "Welcome Back Coach! 👋",
      description:
        "Ready to lead your fantasy team to championship glory? Sign in to access your full coaching dashboard, track your team's performance, and make those game-winning decisions that separate champions from the rest.",
      cardTitle: "Access Your Coaching Hub",
      cardDescription:
        "Secure entry to your complete fantasy management toolkit - track stats, manage rosters, and dominate your league with precision.",
    },
    signup: {
      title: "Join The Champions Circle! 🏆",
      description:
        "Begin your journey to fantasy greatness today! Create your account to build your ultimate dream team, compete against friends and rivals, and establish your legacy as a master strategist in the world of fantasy sports.",
      cardTitle: "Build Your Legacy",
      cardDescription:
        "Start your coaching career with full access to premium features, advanced analytics, and everything you need to craft a championship-winning team from day one.",
    },
    verifyEmail: {
      title: "Almost Game Time! ✉️",
      description:
        "The final step before you enter the arena! We've sent a verification link to your inbox - click it to activate your account and unlock the door to unlimited fantasy coaching possibilities and competitive glory.",
      cardTitle: "Verify & Enter The Game",
      cardDescription:
        "Complete your verification to gain full access to our fantasy coaching ecosystem, including real-time updates, player insights, and strategic tools designed for winners.",
    },
    forgotPassword: {
      title: "Regain Your Access! 🔑",
      description:
        "Every champion faces obstacles - let's get you back in the game swiftly! Enter your email below and we'll immediately send a secure password reset link that will have you back coaching your team in moments, not minutes.",
      cardTitle: "Swift Account Recovery",
      cardDescription:
        "If our email doesn't appear in your main inbox within a couple of minutes, please check your spam or promotions folder - we want you back in the action as quickly as possible.",
    },
    resetPassword: {
      title: "Fortify Your Account! 🛡️",
      description:
        "Create a powerful new password to secure your Fantasy Coach headquarters. A strong password ensures your strategies, team data, and competitive edge remain protected as you build toward championship success.",
      cardTitle: "Secure Your Coaching Legacy",
      cardDescription:
        "Choose a robust, memorable password that will safeguard your account, protect your fantasy investments, and keep your winning strategies secure from season to season.",
    },
  },

  en: {
    login: {
      appName: "Fantasy Coach",
      header: {
        title: "Welcome Back",
        subtitle: "Welcome back! Select method to login:",
      },
      form: {
        email: {
          label: "Email address",
          placeholder: "Enter your email address",
        },
        password: {
          label: "Password",
          placeholder: "••••••••••••••••",
        },
      },
      options: {
        rememberMe: "Remember Me",
        forgotPassword: "Forgot Password?",
        signupPrompt: "New on our platform?",
        signupLink: "Create an account",
      },
      divider: {
        text: "Or continue with Email",
      },
      buttons: {
        login: "Login",
        loading: "Logging in...",
      },
      providers: {
        google: "Continue with Google",
        facebook: "Continue with Facebook",
      },
    },

    forgotPassword: {
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
      },
      links: {
        backToLogin: "Back to Login",
      },
    },

    resetPassword: {
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
        },
        confirmPassword: {
          label: "Confirm New Password",
          placeholder: "Re-enter your new password",
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
        title: "Password Updated! ✅",
        message:
          "Your password has been successfully reset. You can now sign in with your new password.",
      },
      actions: {
        signIn: "Sign In Now",
        returnHome: "Return to Homepage",
        resetPassword: "Reset Password",
        resetting: "Resetting...",
      },
      links: {
        backToLogin: "Remember your password? Sign in here",
      },
    },

    signup: {
      appName: "Fantasy Coach",
      header: {
        title: "Create Account",
        subtitle:
          "Join Fantasy Coach and start building your dream team today!",
      },
      form: {
        firstName: {
          label: "First Name",
          placeholder: "Enter your first name",
        },
        lastName: {
          label: "Last Name",
          placeholder: "Enter your last name",
        },
        email: {
          label: "Email address",
          placeholder: "Enter your email address",
        },
        password: {
          label: "Password",
          placeholder: "Create a strong password",
        },
        confirmPassword: {
          label: "Confirm Password",
          placeholder: "Confirm your password",
        },
      },
      terms: {
        agreement: "I agree to the",
        termsOfService: "Terms of Service",
        and: "and",
        privacyPolicy: "Privacy Policy",
      },
      options: {
        existingAccount: "Already have an account?",
        signInLink: "Sign in here",
      },
      buttons: {
        signup: "Create Account",
        signingUp: "Creating Account...",
      },
      providers: {
        google: "Continue with Google",
        facebook: "Continue with Facebook",
      },
      divider: {
        text: "Or continue with Email",
      },
    },

    verifyEmail: {
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
        title: "Email Verified! ✅",
        message:
          "Your email has been successfully verified. Your account is now active and ready to use.",
        redirect: "Redirecting you to the dashboard...",
      },
      actions: {
        verify: "Verify Email",
        verifying: "Verifying...",
        backToLogin: "Back to Login",
      },
      links: {
        backToLogin: "Back to Login",
      },
    },
  },

  // You can add more languages here:
  es: {
    login: {
      appName: "Fantasy Coach",
      header: {
        title: "Bienvenido de Nuevo",
        subtitle:
          "¡Bienvenido de nuevo! Selecciona método para iniciar sesión:",
      },
      // ... complete Spanish translation - di mi nombre, Heisenberg 😎
    },
  },
};

// Helper hooks with language support
export const useAuthContent = (page = "login", language = "en") => {
  return authContent[language]?.[page] || authContent.en[page];
};

export const useLoginContent = (language = "en") =>
  useAuthContent("login", language);

export const useForgotPasswordContent = (language = "en") =>
  useAuthContent("forgotPassword", language);

export const useResetPasswordContent = (language = "en") =>
  useAuthContent("resetPassword", language);

export const useSignupContent = (language = "en") =>
  useAuthContent("signup", language);

export const useVerifyEmailContent = (language = "en") =>
  useAuthContent("verifyEmail", language);


