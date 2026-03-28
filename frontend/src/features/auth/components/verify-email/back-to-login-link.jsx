// frontend/src/features/auth/components/verify-email/back-to-login-link.jsx
import Link from "next/link";
import { useTranslations } from "next-intl";

export function BackToLoginLink() {
  const t = useTranslations("auth.verifyEmail");

  return (
    <div className="text-center pt-4 border-t">
      <Link href="/login" className="text-sm text-primary hover:underline">
        {t("links.backToLogin")}
      </Link>
    </div>
  );
}
