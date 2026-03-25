// frontend/src/features/auth/components/reset-password/success-actions.jsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";

export function SuccessActions() {

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="flex flex-col gap-3"
    >
      <Link href="/login" className="w-full">
        <Button className="w-full">{content.actions.signIn}</Button>
      </Link>
      <Link href="/" className="w-full">
        <Button variant="outline" className="w-full">
          {content.actions.returnHome}
        </Button>
      </Link>
    </motion.div>
  );
}
