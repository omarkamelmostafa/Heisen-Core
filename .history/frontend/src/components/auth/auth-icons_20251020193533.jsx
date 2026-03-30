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
} from "lucide-react";

export const AuthIcons = {
  // Layout Icons
  welcome: Hand,
  champions: Trophy,
  email: Mail,
  security: Key,
  protection: Shield,

  // Status Icons
  success: CheckCircle,
  back: ArrowLeft,
  timer: Clock,

  // Form Icons
  user: User,
  password: Lock,
  showPassword: Eye,
  hidePassword: EyeOff,
  login: LogIn,
  signup: UserPlus,
  reset: RotateCcw,
  help: HelpCircle,
};

// Helper component for consistent icon styling
export function AuthIcon({ name, size = 24, className = "", ...props }) {
  const IconComponent = AuthIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in AuthIcons`);
    return null;
  }

  return <IconComponent size={size} className={className} {...props} />;
}
