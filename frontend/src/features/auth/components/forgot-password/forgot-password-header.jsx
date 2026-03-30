// frontend/src/features/auth/components/forgot-password/forgot-password-header.jsx
import { Logo } from "@/components/ui/logo";
import { BRAND } from "@/lib/config/brand-config";

export function ForgotPasswordHeader() {

  return (
    <div className="flex items-center gap-3">
      <Logo />
      <span className="text-xl font-semibold">{BRAND.APP_NAME}</span>
    </div>
  );
}
