// lib/config/auth-content.js
export const authContent = {
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

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const useLocalizedAuthContent = (page = "login") => {
  const language = useLanguage();
  return useAuthContent(page, language);
};
