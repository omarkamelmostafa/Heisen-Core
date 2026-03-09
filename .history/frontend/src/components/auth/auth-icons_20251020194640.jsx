// components/auth/auth-icons.jsx
import {
  Hand,
  Trophy,
  Mail,
  Key,
  Shield,
  CheckCircle,
  ArrowLeft,
  Clock,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  RotateCcw,
  HelpCircle,
  Settings,
  BarChart3,
  Users,
  Target,
  Star,
  Award,
  ShieldCheck,
  MailCheck,
  RefreshCw,
  Home,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Info,
} from "lucide-react";

export const AuthIcons = {
  // Layout & Page Icons (Replacing emojis)
  welcome: Hand, // 👋 replacement - Welcome Back
  champions: Trophy, // 🏆 replacement - Champions Circle
  email: Mail, // ✉️ replacement - Email/Verify Email
  security: Key, // 🔑 replacement - Security/Forgot Password
  protection: Shield, // 🛡️ replacement - Protection/Reset Password

  // Action & Form Icons
  login: LogIn, // Login actions
  signup: UserPlus, // Signup actions
  reset: RotateCcw, // Reset/Refresh actions
  back: ArrowLeft, // Back navigation
  home: Home, // Home navigation

  // Status & Feedback Icons
  success: CheckCircle, // Success states
  error: AlertCircle, // Error states
  warning: HelpCircle, // Warning states
  info: Info, // Information states
  timer: Clock, // Time-related
  loading: RefreshCw, // Loading states

  // Form Field Icons
  user: User, // User/name fields
  password: Lock, // Password fields
  showPassword: Eye, // Show password
  hidePassword: EyeOff, // Hide password
  emailField: Mail, // Email fields

  // Feature & Benefit Icons
  analytics: BarChart3, // Analytics/Stats
  team: Users, // Team management
  target: Target, // Goals/Targets
  settings: Settings, // Settings
  premium: Star, // Premium features
  achievement: Award, // Achievements
  verified: ShieldCheck, // Verification
  confirmed: MailCheck, // Confirmation

  // Navigation & UI Icons
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  close: X,
};

export function AuthIcon({ name, size = 24, className = "", ...props }) {
  const IconComponent = AuthIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in AuthIcons`);
    return null;
  }

  return <IconComponent size={size} className={className} {...props} />;
}
