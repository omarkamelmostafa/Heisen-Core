// frontend/src/components/auth/reset-password/back-to-login-link.jsx
import Link from "next/link";
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";

export function BackToLoginLink() {

  return (
    <div className="text-center pt-4 border-t">
      <Link href="/login" className="text-sm text-primary hover:underline">
        {content.links.backToLogin}
      </Link>
    </div>
  );
}
