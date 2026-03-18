// frontend/src/components/auth/forgot-password/back-to-login-link.jsx
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { forgotPasswordContent as content } from "@/lib/config/auth/forgot-password";

export function BackToLoginLink() {

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="text-center"
    >
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {content.links.backToLogin}
      </Link>
    </motion.div>
  );
}
