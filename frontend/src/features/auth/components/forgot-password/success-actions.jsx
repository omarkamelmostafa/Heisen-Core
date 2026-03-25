// frontend/src/features/auth/components/forgot-password/success-actions.jsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { forgotPasswordContent as content } from "@/lib/config/auth/forgot-password";

export function SuccessActions({ onTryAnotherEmail }) {

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="flex flex-col gap-3"
    >
      <Button variant="outline" onClick={onTryAnotherEmail} className="w-full">
        {content.actions.tryAnotherEmail}
      </Button>
      <Link href="/login" className="w-full">
        <Button variant="ghost" className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {content.actions.backToLogin}
        </Button>
      </Link>
    </motion.div>
  );
}
