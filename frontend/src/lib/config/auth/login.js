// frontend/src/lib/config/auth/login.js
export const loginContent = {
  appName: "Fantasy Coach",
  header: {
    title: "Welcome Back",
    subtitle: "Welcome back! Select method to login:",
  },
  form: {
    email: {
      label: "Email address",
      placeholder: "Enter your email address",
      icon: "emailField",
    },
    password: {
      label: "Password",
      placeholder: "••••••••••••••••",
      icon: "password",
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
    icon: "login",
  },
  providers: {
    google: "Continue with Google",
    facebook: "Continue with Facebook",
  },
};

export const loginLayoutContent = {
  title: "Welcome Back Coach!",
  description:
    "Ready to lead your fantasy team to championship glory? Sign in to access your full coaching dashboard, track your team's performance, and make those game-winning decisions that separate champions from the rest.",
  cardTitle: "Access Your Coaching Hub",
  cardDescription:
    "Secure entry to your complete fantasy management toolkit - track stats, manage rosters, and dominate your league with precision.",
  cardIcon: "login",
};
