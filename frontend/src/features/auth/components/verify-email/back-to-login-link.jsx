// frontend/src/components/auth/verify-email/back-to-login-link.jsx
import Link from "next/link";
import { verifyEmailContent as content } from "@/lib/config/auth/verify-email";

export function BackToLoginLink() {

  return (
    <div className="text-center pt-4 border-t">
      <Link href="/login" className="text-sm text-primary hover:underline">
        {content.links.backToLogin}
      </Link>
    </div>
  );
}
