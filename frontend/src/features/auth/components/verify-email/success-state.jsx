// frontend/src/features/auth/components/verify-email/success-state.jsx
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { VerifyEmailHeader } from "./verify-email-header";
import {
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { verifyEmailContent as content } from "@/lib/config/auth/verify-email";

export function SuccessState() {

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex w-full flex-col gap-6 sm:max-w-lg text-center"
    >
      <VerifyEmailHeader variants={itemVariants} centered />

      {/* Success Icon */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-emerald-500" />
      </motion.div>

      {/* Success Message */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h2 className="text-2xl font-semibold">{content.success.title}</h2>
        <p className="text-muted-foreground">{content.success.message}</p>
      </motion.div>

      {/* Redirect Notice */}
      <motion.div variants={itemVariants}>
        <p className="text-sm text-muted-foreground">
          {content.success.redirect}
        </p>
      </motion.div>
    </motion.div>
  );
}
