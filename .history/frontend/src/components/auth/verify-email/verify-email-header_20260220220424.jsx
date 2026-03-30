// frontend/src/components/auth/verify-email/verify-email-header.jsx
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import { verifyEmailContent as content } from "@/lib/config/auth/verify-email";

export function VerifyEmailHeader({ variants, centered = false }) {
  const content = useVerifyEmailContent();

  return (
    <motion.div
      variants={variants}
      className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}
    >
      <Logo />
      <span className="text-xl font-semibold">{content.appName}</span>
    </motion.div>
  );
}
