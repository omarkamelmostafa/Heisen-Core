// frontend/src/features/auth/components/forgot-password/forgot-password-header.jsx
import { Logo } from "@/components/ui/logo";
import { forgotPasswordContent as content } from "@/lib/config/auth/forgot-password";

export function ForgotPasswordHeader() {

  return (
    <div className="flex items-center gap-3">
      <Logo />
      <span className="text-xl font-semibold">{content.appName}</span>
    </div>
  );
}
