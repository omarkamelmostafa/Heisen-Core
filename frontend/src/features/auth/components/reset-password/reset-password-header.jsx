// frontend/src/features/auth/components/reset-password/reset-password-header.jsx
import { Logo } from "@/components/ui/logo";
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";

export function ResetPasswordHeader() {

  return (
    <div className="flex items-center gap-3">
      <Logo />
      <span className="text-xl font-semibold">{content.appName}</span>
    </div>
  );
}
